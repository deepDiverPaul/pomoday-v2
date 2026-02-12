import * as React from 'react';
import { TimeSpent } from './TimeSpent';
import {
  getStatus,
  taskAsString,
  TaskStatus,
  isSameDay,
} from '../helpers/utils';

export const TaskItemDisplay = (props) => {
  const task = props.task;
  const matching = props.matching || undefined;
  return (
    <div className={'flex flex-row'}>
      <div className="el-task-id pt-1 self-start w-8 text-right text-stall-light mr-3 pr-2 border-control2nd border-r-2">
        {task.id}
      </div>
      <div className="el-task-content pt-1 self-center flex-1 text-left">
        <span className={`task-content inline-block relative pl-5`}>
          <span
            className={
              task.status === TaskStatus.DONE
                ? 'el-task-done inline-block text-stall-light line-through'
                : 'el-task-normal inline-block'
            }
            dangerouslySetInnerHTML={{
              __html:
                getStatus(task.status, true) +
                taskAsString(task.title, matching),
            }}
          />
        </span>{' '}
        <TimeSpent task={task} />
        {typeof task.dueDate === 'number' ? (
          <span
            className={
              'ml-2 text-xs ' +
              (task.status === TaskStatus.DONE
                ? 'text-stall-dim'
                : (task.dueDate as number) < Date.now()
                  ? 'text-tomato'
                  : isSameDay(Date.now(), task.dueDate as number)
                    ? 'text-orange'
                    : 'text-stall-dim')
            }
          >
            Due {new Date(task.dueDate as number).toLocaleDateString()}
          </span>
        ) : null}
      </div>
    </div>
  );
};
