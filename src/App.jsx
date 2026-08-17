import { useEffect } from 'react';
import { useHashRoute } from './hooks/useHashRoute.js';
import { AppStateProvider } from './state/AppState.jsx';
import { attachUnlockOnGesture } from './audio/engine.js';
import TabBar from './components/ui/TabBar.jsx';
import GlobalMetronome from './components/metronome/GlobalMetronome.jsx';
import SessionMiniBar from './components/SessionMiniBar.jsx';
import PracticeHome from './pages/PracticeHome.jsx';
import { getSession } from './state/sessionStore.js';
import { sessionPath } from './data/curriculumRegistry.js';
import { getSong } from './data/songbook/index.js';
import SessionView from './pages/SessionView.jsx';
import DrillsView from './pages/DrillsView.jsx';
import ProgressView from './pages/ProgressView.jsx';
import SongbookIndex from './pages/songbook/SongbookIndex.jsx';
import SongbookSongView from './pages/songbook/SongbookSongView.jsx';
import SongLab from './pages/songbook/SongLab.jsx';
import ToolsIndex from './pages/tools/ToolsIndex.jsx';
import ExplorerView from './pages/tools/ExplorerView.jsx';
import ChromaticLab from './pages/tools/ChromaticLab.jsx';
import CagedLibrary from './pages/tools/CagedLibrary.jsx';
import DiatonicTriads from './pages/tools/DiatonicTriads.jsx';
import Diatonic7ths from './pages/tools/Diatonic7ths.jsx';
import Intervals from './pages/tools/Intervals.jsx';
import Modes from './pages/tools/Modes.jsx';
import CagedModes from './pages/tools/CagedModes.jsx';
import CofView from './pages/tools/CofView.jsx';

const TOOL_ROUTES = {
  explorer: ExplorerView,
  chromatic: ChromaticLab,
  caged: CagedLibrary,
  triads: DiatonicTriads,
  sevenths: Diatonic7ths,
  intervals: Intervals,
  modes: Modes,
  'caged-modes': CagedModes,
  cof: CofView,
};

export default function App() {
  const { segments, navigate, back } = useHashRoute();

  useEffect(() => {
    attachUnlockOnGesture();
  }, []);

  const [root = 'practice', sub, view, param] = segments;
  const routeSong = root === 'songbook' && sub ? getSong(sub) : null;
  const closeSession = (context) => {
    if (context?.curriculum === 'songbook' && context.songId) {
      navigate(`songbook/${context.songId}`, { replace: true });
    } else {
      navigate('practice', { replace: true });
    }
  };

  let content = null;
  let hideTabBar = false;

  if (root === 'tools' && sub && TOOL_ROUTES[sub]) {
    const Tool = TOOL_ROUTES[sub];
    content = <Tool onClose={back} />;
    hideTabBar = true;
  } else if (root === 'session') {
    content = (
      <SessionView
        dayIdx={sub ? parseInt(sub, 10) : 0}
        onClose={closeSession}
      />
    );
    hideTabBar = true;
  } else if (root === 'songbook' && routeSong && view === 'lab') {
    content = <SongLab songId={sub} activityId={param} onClose={() => navigate(`songbook/${sub}`, { replace: true })} />;
    hideTabBar = true;
  } else if (root === 'songbook' && routeSong && view === 'session') {
    content = (
      <SessionView
        dayIdx={param ? parseInt(param, 10) : 0}
        curriculum="songbook"
        songId={sub}
        onOpenActivity={(activeSongId, activityId) => navigate(`songbook/${activeSongId}/lab/${activityId}`)}
        onClose={closeSession}
      />
    );
    hideTabBar = true;
  } else if (root === 'songbook' && sub) {
    content = <SongbookSongView songId={sub} onNavigate={navigate} />;
  } else if (root === 'songbook') {
    content = <SongbookIndex onOpen={(id) => navigate(`songbook/${id}`)} />;
  } else if (root === 'drills') {
    content = <DrillsView />;
  } else if (root === 'tools') {
    content = <ToolsIndex onOpen={(id) => navigate(`tools/${id}`)} />;
  } else if (root === 'progress') {
    content = <ProgressView />;
  } else {
    content = <PracticeHome onNavigate={navigate} />;
  }

  const sessionRoute = root === 'session' || (root === 'songbook' && !!routeSong && view === 'session');

  return (
    <AppStateProvider>
      <div className="shell">
        {!hideTabBar && <TabBar active={root === 'tools' ? 'tools' : root} onNavigate={(id) => navigate(id)} />}
        <div className="shell-content">{content}</div>
        {!sessionRoute && (
          <SessionMiniBar onOpen={() => navigate(sessionPath(getSession()))} />
        )}
        <GlobalMetronome />
      </div>
    </AppStateProvider>
  );
}
