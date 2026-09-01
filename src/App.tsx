import { useEffect, useState } from 'react';
import './index.css';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { Composer } from './components/Composer';
import { ModelLoadingBar } from './components/ModelLoadingBar';
import { WebGPUUnsupported } from './components/WebGPUUnsupported';
import { TypingIndicator } from './components/TypingIndicator';
import { StatusBar } from './components/StatusBar';
import { TokenStatsBar } from './components/TokenStatsBar';
import { PairingModal } from './components/PairingModal';
import { FileDropZone } from './components/FileDropZone';
import { CompareView } from './components/CompareView';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { StoragePanelModal } from './components/StoragePanelModal';
import { ExportImportModal } from './components/ExportImportModal';
import { SettingsModal } from './components/SettingsModal';
import { useMessages } from './store/useMessages';
import { useSyncedMessages } from './store/useSyncedMessages';
import { useEngine } from './store/useEngine';
import { useOnlineStatus } from './lib/useOnlineStatus';
import { useInstallPrompt } from './lib/useInstallPrompt';
import { useSyncFlag } from './lib/useSyncFlag';
import { useRoomId } from './lib/useRoomId';
import { usePersonas } from './lib/usePersonas';
import { useRag } from './lib/useRag';
import { useCompareMode } from './lib/useCompareMode';
import { useConversations } from './lib/useConversations';
import { requestPersistentStorage } from './lib/persistStorage';

function App() {
  const engine = useEngine();
  const isOnline = useOnlineStatus();
  const { canInstall, promptInstall } = useInstallPrompt();
  const { syncEnabled, toggleSync } = useSyncFlag();
  const { roomId, shortCode, adoptRoomId, resetRoomId } = useRoomId();
  const {
    personas,
    activePersona,
    setActivePersona,
    addPersona,
    deletePersona,
  } = usePersonas();
  const rag = useRag();
  const compare = useCompareMode();

  // Multi-thread conversation manager
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    renameConversation,
    deleteConversation,
    touchConversation,
  } = useConversations();

  // Modal open states
  const [pairingOpen, setPairingOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Message stores wired to active conversation ID
  const localMessages = useMessages(
    engine,
    activeConversationId,
    activePersona.systemPrompt,
    rag.buildContextMessage,
  );
  const syncedMessages = useSyncedMessages(
    engine,
    syncEnabled,
    roomId,
    activePersona.systemPrompt,
    rag.buildContextMessage,
  );

  const activeStore = syncEnabled ? syncedMessages : localMessages;
  const {
    messages,
    isLoading,
    isGenerating,
    sendMessage,
    editMessage,
    regenerateResponse,
    clearMessages,
    tokenStats,
  } = activeStore;
  const peerCount =
    syncEnabled && 'peerCount' in activeStore ? activeStore.peerCount : 0;

  // Request persistent storage on first load
  useEffect(() => {
    requestPersistentStorage();
  }, []);

  async function handleSend(content: string) {
    const userMsg = await sendMessage(content);
    if (userMsg) {
      await touchConversation(activeConversationId, content);
    }
  }

  function handleLoadModel() {
    engine.initEngine();
  }

  function handleModelSelect(modelId: string) {
    engine.initEngine(modelId);
  }

  // Determine what to render in the main content area
  const isEngineLoading =
    engine.status === 'loading' || engine.status === 'checking-gpu';
  const isUnsupported = engine.status === 'unsupported';
  const composerDisabled = isGenerating || isEngineLoading || isUnsupported;

  const showTyping =
    isGenerating &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].content === '';

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100">
      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[100px]" />
      </div>

      {/* App layout */}
      <div
        className="relative z-10 flex h-full min-h-0 flex-col"
        role="main"
        aria-label="EdgeChat application"
      >
        <Header
          messageCount={messages.length}
          onClear={clearMessages}
          engineStatus={engine.status}
          modelId={engine.modelId}
          onModelSelect={handleModelSelect}
          personas={personas}
          activePersona={activePersona}
          onSelectPersona={setActivePersona}
          onAddPersona={addPersona}
          onDeletePersona={deletePersona}
          syncEnabled={syncEnabled}
          isCompareMode={compare.isCompareMode}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Online/offline indicator + install prompt */}
        <StatusBar
          isOnline={isOnline}
          canInstall={canInstall}
          onInstall={promptInstall}
        />

        {/* Main content area */}
        {compare.isCompareMode ? (
          <CompareView
            modelA={compare.modelA}
            modelB={compare.modelB}
            onSetModelA={compare.setModelA}
            onSetModelB={compare.setModelB}
            systemPrompt={activePersona.systemPrompt}
          />
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col">
              {isUnsupported ? (
                <WebGPUUnsupported reason={engine.errorMessage ?? ''} />
              ) : isEngineLoading ? (
                <ModelLoadingBar progress={engine.loadProgress} />
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    engineStatus={engine.status}
                    onLoadModel={handleLoadModel}
                    onEditMessage={editMessage}
                    onRegenerateResponse={regenerateResponse}
                    onSelectPrompt={handleSend}
                  />
                  {showTyping && <TypingIndicator />}
                </>
              )}
            </div>

            {/* Token stats overlay */}
            <TokenStatsBar stats={tokenStats} />

            {/* RAG file drop zone */}
            <div className="mx-auto w-full max-w-3xl shrink-0 px-3 sm:px-4">
              <FileDropZone
                documents={rag.documents}
                embeddingStatus={rag.embeddingStatus}
                embeddingProgress={rag.embeddingProgress}
                onAddFile={rag.addFile}
                onRemoveDocument={rag.removeDocument}
                processingFile={rag.processingFile}
              />
            </div>

            <Composer onSend={handleSend} disabled={composerDisabled} />
          </>
        )}
      </div>

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={() => createConversation()}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onOpenStoragePanel={() => setStorageOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenExportImport={() => setExportImportOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMatch={(id) => setActiveConversationId(id)}
      />

      {/* Storage Inspector Modal */}
      <StoragePanelModal
        isOpen={storageOpen}
        onClose={() => setStorageOpen(false)}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={exportImportOpen}
        onClose={() => setExportImportOpen(false)}
        activeConversationId={activeConversationId}
        onImportSuccess={(newConvId) => setActiveConversationId(newConvId)}
      />

      {/* Settings & Tools Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        messageCount={messages.length}
        onClear={clearMessages}
        engineStatus={engine.status}
        modelId={engine.modelId}
        onModelSelect={handleModelSelect}
        personas={personas}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        onAddPersona={addPersona}
        onDeletePersona={deletePersona}
        isCompareMode={compare.isCompareMode}
        onToggleCompare={compare.toggleCompareMode}
        syncEnabled={syncEnabled}
        peerCount={peerCount}
        onToggleSync={toggleSync}
        onOpenPairing={() => setPairingOpen(true)}
        onOpenStorage={() => setStorageOpen(true)}
        onOpenExportImport={() => setExportImportOpen(true)}
      />

      {/* Pairing Modal */}
      <PairingModal
        isOpen={pairingOpen}
        onClose={() => setPairingOpen(false)}
        roomId={roomId}
        shortCode={shortCode}
        onAdoptRoomId={(newId) => {
          adoptRoomId(newId);
          if (!syncEnabled) toggleSync();
        }}
        onReset={resetRoomId}
      />
    </div>
  );
}

export default App;
