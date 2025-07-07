/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import { USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { Filter } from './types/Filter';
import { client } from './utils/fetchClient';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>();
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);
  const errorTimeout = useRef<number | null>(null);

  const activeTodos = todos?.filter(todo => !todo.completed).length;

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await client.get<Todo[]>(`/todos?userId=${USER_ID}`);

        setTodos(response);
      } catch {
        if (errorTimeout.current !== null) {
          clearTimeout(errorTimeout.current);
        }

        setError('Unable to load todos');
        errorTimeout.current = window.setTimeout(() => setError(null), 3000);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        {todos?.length !== 0 && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              {todos
                ?.filter((todo: Todo) => {
                  if (filter === 'active') {
                    return !todo.completed;
                  }

                  if (filter === 'completed') {
                    return todo.completed;
                  }

                  return true;
                })
                .map(todo => (
                  <div
                    data-cy="Todo"
                    className={`todo${todo.completed ? ' completed' : ''}`}
                    key={todo.id}
                  >
                    <label className="todo__status-label">
                      <input
                        data-cy="TodoStatus"
                        type="checkbox"
                        className="todo__status"
                        checked={todo.completed}
                      />
                    </label>

                    <span data-cy="TodoTitle" className="todo__title">
                      {todo.title}
                    </span>

                    {/* Remove button appears only on hover */}
                    <button
                      type="button"
                      className="todo__remove"
                      data-cy="TodoDelete"
                    >
                      ×
                    </button>

                    {/* overlay will cover the todo while it is being deleted or updated */}
                    <div data-cy="TodoLoader" className="modal overlay">
                      {/* eslint-disable-next-line */}
                      <div className="modal-background has-background-white-ter" />
                      <div className="loader" />
                    </div>
                  </div>
                ))}
            </section>

            {/* Hide the footer if there are no todos */}
            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {activeTodos || 0} items left
              </span>

              {/* Active link should have the 'selected' class */}
              <nav className="filter" data-cy="Filter">
                <a
                  href="#/"
                  className={`filter__link${filter === 'all' ? ' selected' : ''}`}
                  data-cy="FilterLinkAll"
                  onClick={() => setFilter('all')}
                >
                  All
                </a>

                <a
                  href="#/active"
                  className={`filter__link${filter === 'active' ? ' selected' : ''}`}
                  data-cy="FilterLinkActive"
                  onClick={() => setFilter('active')}
                >
                  Active
                </a>

                <a
                  href="#/completed"
                  className={`filter__link${filter === 'completed' ? ' selected' : ''}`}
                  data-cy="FilterLinkCompleted"
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </a>
              </nav>

              {/* this button should be disabled if there are no completed todos */}
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal${error ? '' : ' hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError(null)}
        />
        {/* show only one message at a time */}
        {error}
      </div>
    </div>
  );
};
