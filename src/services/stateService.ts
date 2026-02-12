import * as React from 'react';
import { useInterval } from '../helpers/hooks';
import { pullFromDB, pushToDB } from '../helpers/api';
import {
  AUTO_SYNC_TIMER,
  createTask,
  generateUuid,
  getHistoryQueue,
  SYNC_TIMER,
  TaskItem,
  TaskStatus,
} from '../helpers/utils';

export const StateContext = React.createContext<any>(null);

// Tutorial/default tasks
const tutorialTasks: TaskItem[] = [
  createTask(1, '@demo', "Let's learn the basic of Pomoday:", TaskStatus.FLAG),
  createTask(2, '@demo', 'This is a task', TaskStatus.WAIT),
  createTask(3, '@demo', 'This is an ongoing task', TaskStatus.WIP, [
    { start: Date.now(), end: 0 },
  ]),
  createTask(4, '@demo', 'This is a finished task', TaskStatus.DONE, [
    { start: Date.now() - 1.5 * 60 * 60 * 1000, end: Date.now() },
  ]),
  createTask(
    5,
    '@demo',
    'You can open the command input by pressing any key. Multiline input starts with capital characters.',
    TaskStatus.WAIT,
  ),
  createTask(
    6,
    '@demo',
    'In the command input, you can create a new task by entering the task content. Yes, markdown is\n\nsupported! You can also create a task with a tag, type `@<tag-name>` at the beginning.',
    TaskStatus.WAIT,
  ),
  createTask(
    7,
    '@demo',
    'Type `b` or `begin` followed by the `task id` to start the timer on a task.',
    TaskStatus.WAIT,
  ),
  createTask(
    8,
    '@demo',
    'Type `s` or `stop` followed by the `task id` to stop the timer.',
    TaskStatus.WAIT,
  ),
  createTask(
    9,
    '@demo',
    'Now, try use `c` or `check` followed by the `task id` to mark a task as done.',
    TaskStatus.WAIT,
  ),
  createTask(
    10,
    '@demo',
    'Type `e` or `edit`, followed by the `task id` to edit task content.',
    TaskStatus.WAIT,
  ),
  createTask(
    11,
    '@demo',
    "To see how your day's going, type `today`. Try it!",
    TaskStatus.WAIT,
  ),
  createTask(
    12,
    '@demo',
    "That's all! Now, type `delete @demo` to remove all of this tutorial content and start using Pomoday!",
    TaskStatus.FLAG,
  ),
];

const defaultState: any = {
  tasks: tutorialTasks,
  showHelp: false,
  showQuickHelp: true,
  showToday: false,
  darkMode: false,
  sawTheInput: false,
  taskVisibility: {
    done: true,
    flagged: true,
    wait: true,
    wip: true,
  },
  history: getHistoryQueue(),
  showSettings: false,
  settings: {
    hintPopup: true,
    stickyInput: false,
    autoDarkMode: false,
  },
  showCustomCSS: false,
  customCSS: '',
  showArchived: false,
  userWantToLogin: false,
  authToken: '',
  userName: '',
  serverUrl: '',
  lastSync: 0,
  filterBy: '',
};

const getInitialState = () => {
  // Start from local backup to avoid blank UI, but backend remains source of truth
  if (window.localStorage) {
    const saved = window.localStorage.getItem('pomoday');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          for (let key in defaultState) {
            if (!parsed.hasOwnProperty(key)) {
              (parsed as any)[key] = (defaultState as any)[key];
            }
            // fill up all missing data because of schema changes here
            if (key === 'tasks') {
              (parsed as any)[key] = (parsed as any)[key].map(
                (t: TaskItem) => ({
                  ...t,
                  uuid: (t as any).uuid || generateUuid(),
                  logs: (t as any).logs || [],
                  archived: (t as any).archived || false,
                  lastaction: (t as any).lastaction || Date.now(),
                  dueDate:
                    typeof (t as any).dueDate === 'number'
                      ? (t as any).dueDate
                      : null,
                }),
              );
            }
          }
          return parsed;
        }
      } catch {}
    }
  }
  return defaultState;
};

let pushInProgress = false;
export const syncTasks = async (state, setState, isPull: boolean) => {
  if (!isPull) {
    if (state.tasks.length) {
      pushInProgress = true;
      const data = await pushToDB(
        state.tasks,
        state.serverUrl,
        state.authToken,
      );
      pushInProgress = false;
      setState({
        ...state,
        tasks: data.tasks,
        lastSync: Date.now(),
      });
    }
  } else {
    if (!pushInProgress) {
      const data = await pullFromDB(state.serverUrl, state.authToken);
      setState({
        ...state,
        tasks: data.tasks,
        lastSync: Date.now(),
      });
    }
  }
};

export const useAppState = () => {
  const [state, setState] = React.useState<any>(getInitialState());

  // Always keep a local backup snapshot; backend is the source of truth
  React.useEffect(() => {
    try {
      window.localStorage.setItem('pomoday', JSON.stringify(state));
    } catch {}
  }, [state]);

  // Initial backend pull (source of truth) when auth available
  React.useEffect(() => {
    if (state.authToken && Date.now() - state.lastSync >= SYNC_TIMER) {
      (async () => {
        await syncTasks(state, setState, true);
      })();
    }
    // We want this to run when token changes or tasks changed significantly
  }, [state.tasks, state.authToken]);

  // Auto-sync pull on interval to keep in sync with backend
  useInterval(
    () => {
      if (state.authToken && Date.now() - state.lastSync >= SYNC_TIMER) {
        (async () => {
          await syncTasks(state, setState, true);
        })();
      }
    },
    state.authToken ? AUTO_SYNC_TIMER : 0,
  );

  return [state, setState] as const;
};
