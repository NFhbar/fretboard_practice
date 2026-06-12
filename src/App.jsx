import { useEffect } from 'react';
import { useHashRoute } from './hooks/useHashRoute.js';
import { AppStateProvider } from './state/AppState.jsx';
import { attachUnlockOnGesture } from './audio/engine.js';
import TabBar from './components/ui/TabBar.jsx';
import GlobalMetronome from './components/metronome/GlobalMetronome.jsx';
import PracticeHome from './pages/PracticeHome.jsx';
import SessionView from './pages/SessionView.jsx';
import DrillsView from './pages/DrillsView.jsx';
import ProgressView from './pages/ProgressView.jsx';
import ToolsIndex from './pages/tools/ToolsIndex.jsx';
import ExplorerView from './pages/tools/ExplorerView.jsx';
import CagedLibrary from './pages/tools/CagedLibrary.jsx';
import DiatonicTriads from './pages/tools/DiatonicTriads.jsx';
import Diatonic7ths from './pages/tools/Diatonic7ths.jsx';
import Intervals from './pages/tools/Intervals.jsx';
import Modes from './pages/tools/Modes.jsx';
import CagedModes from './pages/tools/CagedModes.jsx';
import CofView from './pages/tools/CofView.jsx';

const TOOL_ROUTES = {
  explorer: ExplorerView,
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

  const [root = 'practice', sub] = segments;

  let content = null;
  let hideTabBar = false;

  if (root === 'tools' && sub && TOOL_ROUTES[sub]) {
    const Tool = TOOL_ROUTES[sub];
    content = <Tool onClose={back} />;
    hideTabBar = true;
  } else if (root === 'session') {
    content = <SessionView dayIdx={sub ? parseInt(sub, 10) : 0} onClose={() => navigate('practice', { replace: true })} />;
    hideTabBar = true;
  } else if (root === 'drills') {
    content = <DrillsView />;
  } else if (root === 'tools') {
    content = <ToolsIndex onOpen={(id) => navigate(`tools/${id}`)} />;
  } else if (root === 'progress') {
    content = <ProgressView />;
  } else {
    content = <PracticeHome onNavigate={navigate} />;
  }

  return (
    <AppStateProvider>
      <div className="shell">
        {!hideTabBar && <TabBar active={root === 'tools' ? 'tools' : root} onNavigate={(id) => navigate(id)} />}
        <div className="shell-content">{content}</div>
        <GlobalMetronome />
      </div>
    </AppStateProvider>
  );
}
