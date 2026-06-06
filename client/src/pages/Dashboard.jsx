import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { clearAuth, getUser, isAuthenticated } from '../utils/auth.js';

const defaultForm = { title: '', description: '', status: 'pending' };

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit] = useState(1000);

  const user = useMemo(() => getUser(), []);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadTasks();
  }, [navigate, search, statusFilter]);

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/tasks', {
        params: { limit, search: search.trim(), status: statusFilter || undefined },
      });
      setTasks(response.data.tasks);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      window.confirm('Task title cannot be empty.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        setEditingTask(null);
      } else {
        await api.post('/tasks', payload);
      }
      setForm(defaultForm);
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save task.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description || '', status: task.status });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete task.');
    }
  };

  const handleToggle = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setForm(defaultForm);
    setError('');
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <main className="h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex h-full min-h-screen max-w-280 flex-col">
        <header className="flex flex-col gap-6 px-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-indigo-600">Welcome back</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:mt-2">{user?.name || 'Task Manager'}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Track tasks, complete work, and stay organized.</p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-[0.8rem] bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition duration-200 hover:bg-slate-200 hover:ring-slate-300"
            onClick={logout}
          >
            Sign out
          </button>
        </header>

        <section className="grid flex-1 min-h-0 gap-4 px-4 pb-6 md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{editingTask ? 'Edit task' : 'New task'}</h2>
                <p className="mt-2 text-slate-600">{editingTask ? 'Update a saved task.' : 'Create a task for your list.'}</p>
              </div>
            </div>
            <form className="grid gap-4" onSubmit={submitTask}>
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Task title</span>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Write a quick title"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  rows="3"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Add optional notes"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Status</span>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center rounded-[0.8rem] bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.18)] transition duration-200 hover:-translate-y-0.5"
                  type="submit"
                >
                  {editingTask ? 'Save changes' : 'Add task'}
                </button>
                {editingTask && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[0.8rem] border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="self-stretch flex h-full min-h-0 flex-col rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Task list</h2>
                <p className="mt-2 text-slate-600">Search, filter, and manage tasks for today.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="min-w-45 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  type="search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); }}
                  placeholder="Search tasks"
                />
                <select
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={statusFilter}
                  onChange={(event) => { setStatusFilter(event.target.value); }}
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="rounded-4xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                Loading tasks…
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-4xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                No tasks found. Add one to get started.
              </div>
            ) : (
              <div className="space-y-4 flex-1 min-h-0 overflow-y-auto task-list">
                {tasks.map((task) => (
                  <article key={task._id} className="rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {task.description || 'No description added.'}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {task.status}
                        </span>
                        <time>{new Date(task.createdAt).toLocaleDateString()}</time>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center justify-center rounded-[0.8rem] border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50"
                          onClick={() => handleToggle(task._id)}
                        >
                          {task.status === 'completed' ? 'Mark pending' : 'Mark done'}
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-[0.8rem] bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition duration-200 hover:bg-slate-200"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-[0.8rem] bg-red-500 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-red-600"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
