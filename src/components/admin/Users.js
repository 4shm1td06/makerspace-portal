import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Download, Loader2 } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        reg_no,
        mobile_no,
        blood_type,
        role,
        bio,
        age,
        gender,
        mentor,
        expertise,
        address,
        emergency_contact_info (
          name,
          phone,
          address,
          relation,
          blood_type
        )
      `);

    if (error) {
      console.error('Error fetching users:', error.message);
    } else {
      setUsers(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    handleFilterAndSort();// eslint-disable-next-line
  }, [search, sortKey, users]);

  const handleFilterAndSort = () => {
    let temp = [...users];
    if (search) {
      const query = search.toLowerCase();
      temp = temp.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.reg_no?.toLowerCase().includes(query)
      );
    }

    if (sortKey) {
      temp.sort((a, b) => {
        const valA = a[sortKey] || '';
        const valB = b[sortKey] || '';
        return valA.localeCompare(valB);
      });
    }

    setFiltered(temp);
  };

  const exportToCSV = () => {
    const headers = ['S.No', 'Name', 'Email', 'User ID', 'Reg No', 'Mobile No', 'Blood Type', 'Role'];
    const rows = filtered.map((user, i) => [
      i + 1,
      user.name,
      user.email,
      user.id,
      user.reg_no,
      user.mobile_no,
      user.blood_type,
      user.role,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell || ''}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin mr-2" /> Loading users...
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Registered Users</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name, email, reg no..."
            className="px-3 py-1.5 border rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="px-2 py-1.5 border rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Sort</option>
            <option value="name">Name</option>
            <option value="reg_no">Reg No</option>
            <option value="role">Role</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">S.No.</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">User ID</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-left">Mobile No</th>
              <th className="px-4 py-3 text-left">Blood Type</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.length > 0 ? (
              filtered.map((user, index) => (
                <React.Fragment key={user.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-center">{index + 1}</td>
                    <td className="px-4 py-3">{user.name || '-'}</td>
                    <td className="px-4 py-3">{user.email || '-'}</td>
                    <td className="px-4 py-3">{user.id || '-'}</td>
                    <td className="px-4 py-3">{user.reg_no || '-'}</td>
                    <td className="px-4 py-3">{user.mobile_no || '-'}</td>
                    <td className="px-4 py-3">{user.blood_type || '-'}</td>
                    <td className="px-4 py-3 capitalize">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {user.role || 'user'}
                      </span>
                    </td>
                  </tr>

                  {expandedId === user.id && (
                    <tr className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      <td colSpan="8" className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <p><strong>Bio:</strong> {user.bio || '-'}</p>
                          <p><strong>Address:</strong> {user.address || '-'}</p>
                          <p><strong>Expertise:</strong> {user.expertise || '-'}</p>
                          <p><strong>Age:</strong> {user.age || '-'}</p>
                          <p><strong>Gender:</strong> {user.gender || '-'}</p>
                          <p><strong>Mentor:</strong> {user.mentor || '-'}</p>
                          <hr className="col-span-2 border-gray-300 dark:border-gray-700" />
                          <h3 className="col-span-2 font-semibold text-lg text-blue-600 dark:text-blue-300">Emergency Contact Info</h3>
                          <p><strong>Name:</strong> {user.emergency_contact_info?.name || '-'}</p>
                          <p><strong>Phone:</strong> {user.emergency_contact_info?.phone || '-'}</p>
                          <p><strong>Relation:</strong> {user.emergency_contact_info?.relation || '-'}</p>
                          <p><strong>Address:</strong> {user.emergency_contact_info?.address || '-'}</p>
                          <p><strong>Blood Type:</strong> {user.emergency_contact_info?.blood_type || '-'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
