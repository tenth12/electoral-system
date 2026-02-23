'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

interface User {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRole, setEditRole] = useState('');

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        try {
            await adminService.updateUser(selectedUser._id, { role: editRole });
            // Refresh users
            const updatedUsers = users.map(u => 
                u._id === selectedUser._id ? { ...u, role: editRole } : u
            );
            setUsers(updatedUsers);
            setIsModalOpen(false);
            alert('User updated successfully');
        } catch (error) {
            alert('Failed to update user');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminService.deleteUser(id);
            // Refresh users
            const updatedUsers = users.filter(u => u._id !== id);
            setUsers(updatedUsers);
            alert('User deleted successfully');
        } catch (error) {
            alert('Failed to delete user');
            console.error(error);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
                <div className="text-sm text-slate-500">Total: {users.length}</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs">Email</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs">Role</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs">Created At</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs">Actions</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-700 font-medium">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                                          user.role === 'candidate' ? 'bg-pink-100 text-pink-600' : 
                                          'bg-blue-100 text-blue-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleEdit(user)}
                                        className="text-slate-400 hover:text-blue-500 font-bold text-sm"
                                    >
                                        Edit
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleDelete(user._id)}
                                        className="text-slate-400 hover:text-red-500 font-bold text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Edit User</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input 
                                type="text" 
                                value={selectedUser?.email} 
                                disabled 
                                className="w-full px-3 py-2 bg-slate-100 rounded-lg text-slate-500"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select 
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                            >
                                <option value="user">User</option>
                                <option value="candidate">Candidate</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
