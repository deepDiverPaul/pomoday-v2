import * as React from 'react';
import { StateContext } from '../services/stateService';
import {
  isSameDay,
  TaskStatus,
  taskAsString,
  counterAsLog,
  getStatus,
} from '../helpers/utils';

export const Today = () => {
  const [state, setState] = React.useContext(StateContext);
  const now = Date.now();
  // Build activity logs for today
  const today = state.tasks.reduce((tasks, t) => {
    if (t.logs) {
      const works = t.logs.reduce((logs, l, id) => {
        if (
          (l.start && isSameDay(now, l.start)) ||
          (l.end && isSameDay(now, l.end))
        ) {
          logs.push({
            task: t.title,
            start: l.start,
            end: l.end,
            done:
              (l.end &&
                id === t.logs.length - 1 &&
                t.status === TaskStatus.DONE) ||
              false,
          });
        }
        return logs;
      }, []);
      tasks = tasks.concat(works);
    }
    return tasks;
  }, []);
  today.sort((a, b) => a.start - b.start);
  const totalTime =
    today.reduce((total, t) => total + ((t.end || now) - t.start), 0) / 1000;

  // Compute due-today and upcoming tasks (next 7 days)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);
  const endOf7Days = new Date(startOfDay.getTime() + 7 * 86400000 - 1);

  const activeTasks = state.tasks
    .filter((t) => t.status !== TaskStatus.NONE)
    .filter((t) => !t.archived);

  const dueTodayTasks = activeTasks
    .filter((t) => typeof t.dueDate === 'number')
    .filter((t) => t.status !== TaskStatus.DONE)
    .filter(
      (t) =>
        (t.dueDate as number) >= startOfDay.getTime() &&
        (t.dueDate as number) <= endOfDay.getTime(),
    )
    .sort((a, b) => (a.dueDate as number) - (b.dueDate as number));

  const upcomingTasks = activeTasks
    .filter((t) => typeof t.dueDate === 'number')
    .filter((t) => t.status !== TaskStatus.DONE)
    .filter(
      (t) =>
        (t.dueDate as number) > endOfDay.getTime() &&
        (t.dueDate as number) <= endOf7Days.getTime(),
    )
    .sort((a, b) => (a.dueDate as number) - (b.dueDate as number));

  const closeToday = () => {
    setState({
      ...state,
      showToday: false,
    });
  };

  const todayAsString = () => {
    return (
      <>
        <div className="el-sideview-header text-stall-dim font-bold text-lg">
          Activities Today
        </div>
        <div className="el-sideview-sub-header text-sm text-stall-dim font-normal uppercase">
          {`${new Date().toLocaleDateString()}`}
        </div>
      </>
    );
  };

  return (
    <>
      <div className={'block sm:hidden fixed bottom-0 right-0 m-5 z-50'}>
        <button
          onClick={closeToday}
          className={
            'sm:hidden text-3xl bg-tomato text-white rounded-full shadow-lg w-16 h-16'
          }
        >
          ✕
        </button>
      </div>
      {/* Due Today Section */}
      <div className="mb-4">
        <div className="el-sideview-header text-stall-dim font-bold text-lg">
          Due Today
        </div>
        <div className="el-sideview-sub-header text-sm text-stall-dim font-normal uppercase">
          {`${new Date().toLocaleDateString()}`}
        </div>
      </div>
      {dueTodayTasks.map((t, i) => (
        <div className="mb-2 flex flex-row" key={`due-today-${i}`}>
          <div className="flex-1">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  getStatus(t.status, false) + ' ' + taskAsString(t.title),
              }}
            />
            <div className="text-sm text-stall-dim">
              <span>
                Due: {new Date(t.dueDate as number).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Upcoming Section */}
      <div className="mb-4 mt-6">
        <div className="el-sideview-header text-stall-dim font-bold text-lg">
          Upcoming (next 7 days)
        </div>
      </div>
      {upcomingTasks.map((t, i) => (
        <div className="mb-2 flex flex-row" key={`upcoming-${i}`}>
          <div className="flex-1">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  getStatus(t.status, false) + ' ' + taskAsString(t.title),
              }}
            />
            <div className="text-sm text-stall-dim">
              <span>
                Due: {new Date(t.dueDate as number).toLocaleDateString()}{' '}
                {new Date(t.dueDate as number).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Activities Today */}
      <div className="mb-4">{todayAsString()}</div>
      {today.map((t, i) => (
        <div className="mb-2 flex flex-row" key={i}>
          <div
            className={`text-right text-sm pr-3 mr-3 border-r-2 ${
              t.done
                ? 'border-green'
                : !t.end
                  ? 'border-orange'
                  : 'border-stall-dim'
            }`}
          >
            <span className="block text-stall-dim">
              {new Date(t.start).toLocaleTimeString().padStart(11, '0')}
            </span>
            {t.end ? (
              <span className="block">
                {new Date(t.end).toLocaleTimeString().padStart(11, '0')}
              </span>
            ) : null}
          </div>
          <div className="flex-1">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  getStatus(!t.done && !t.end ? TaskStatus.WIP : null, false) +
                  ' ' +
                  taskAsString(t.task),
              }}
            />
            <div className="text-sm text-stall-dim">
              {!t.end ? null : (
                <span>
                  {t.done ? <span className="text-green">✔</span> : null}{' '}
                  {counterAsLog((t.end - t.start) / 1000)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4">
        Time spent:{' '}
        <span className="text-tomato">{counterAsLog(totalTime)}</span>
      </div>
    </>
  );
};
