import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/admin/users')
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN'
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading users...</div>

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <p className="section-label">Administration</p>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and administer all registered active users on the platform.</p>
        </div>
      </div>

      <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem', color: 'var(--on-surface-variant)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--on-surface-variant)' }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--on-surface-variant)' }}>Joined</th>
              <th style={{ padding: '1rem', color: 'var(--on-surface-variant)' }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--on-surface-variant)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{u.name}</td>
                <td style={{ padding: '1rem' }}>{u.email}</td>
                <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="chip" style={{ background: u.role === 'ADMIN' ? 'rgba(211,47,47,0.2)' : 'rgba(255,255,255,0.05)', color: u.role === 'ADMIN' ? 'var(--primary)' : 'var(--on-surface)' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleRoleChange(u.id, u.role)} className="btn-ghost" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
