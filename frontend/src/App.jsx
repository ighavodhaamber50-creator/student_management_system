import { useState, useEffect } from 'react'
import {
  MdDashboard,
  MdPeople,
  MdPersonAdd,
  MdSettings,
  MdSearch,
  MdSunny,
  MdDarkMode,
  MdCheckCircle,
  MdCancel,
  MdBook,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdClose,
  MdAdd,
  MdMenu,
  MdLogout,
} from 'react-icons/md'
import api from './api'
import './App.css'

function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Theme
  const [theme, setTheme] = useState('dark')

  // Students data
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    courses: 0,
  })
  const [loading, setLoading] = useState(true)

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterLevel, setFilterLevel] = useState('')

  // Add Student Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    student_id: '',
    course: '',
    level: '',
    enrollment_date: '',
    is_active: true,
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // View Student Modal
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewStudent, setViewStudent] = useState(null)

  // Edit Student Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Delete Confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteStudent, setDeleteStudent] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // Fetch students
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = () => {
    setLoading(true)
    api
      .get('students/')
      .then((response) => {
        setStudents(response.data)
        calculateStats(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching students:', error)
        setLoading(false)
      })
  }

  const calculateStats = (studentData) => {
    const total = studentData.length
    const active = studentData.filter((s) => s.is_active).length
    const inactive = total - active
    const uniqueCourses = new Set(studentData.map((s) => s.course)).size

    setStats({
      totalStudents: total,
      activeStudents: active,
      inactiveStudents: inactive,
      courses: uniqueCourses,
    })
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Get unique courses and levels
  const uniqueCourses = [...new Set(students.map((s) => s.course))].sort()
  const uniqueLevels = [...new Set(students.map((s) => s.level))].sort()

  // Filter students
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      student.first_name.toLowerCase().includes(searchLower) ||
      student.last_name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.student_id.toLowerCase().includes(searchLower) ||
      student.course.toLowerCase().includes(searchLower)

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && student.is_active) ||
      (filterStatus === 'inactive' && !student.is_active)

    const matchesCourse = filterCourse === '' || student.course === filterCourse
    const matchesLevel = filterLevel === '' || student.level === filterLevel

    return matchesSearch && matchesStatus && matchesCourse && matchesLevel
  })

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterCourse('')
    setFilterLevel('')
  }

  // ===== ADD STUDENT =====
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setFormError('')
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone ||
      !formData.date_of_birth ||
      !formData.gender ||
      !formData.student_id ||
      !formData.course ||
      !formData.level ||
      !formData.enrollment_date
    ) {
      setFormError('All fields are required')
      return
    }

    setSubmitting(true)

    api
      .post('students/create/', formData)
      .then((response) => {
        setFormSuccess('Student added successfully!')
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          gender: '',
          student_id: '',
          course: '',
          level: '',
          enrollment_date: '',
          is_active: true,
        })
        setTimeout(() => {
          setShowAddModal(false)
          fetchStudents()
        }, 1500)
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.email?.[0] ||
          error.response?.data?.student_id?.[0] ||
          'Failed to add student'
        setFormError(errorMsg)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // ===== VIEW STUDENT =====
  const handleViewStudent = (student) => {
    setViewStudent(student)
    setShowViewModal(true)
  }

  // ===== EDIT STUDENT =====
  const handleEditStudent = (student) => {
    setEditStudent(student)
    setEditFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      student_id: student.student_id,
      course: student.course,
      level: student.level,
      enrollment_date: student.enrollment_date,
      is_active: student.is_active,
    })
    setEditError('')
    setEditSuccess('')
    setShowEditModal(true)
  }

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setEditError('')
  }

  const handleSubmitEditForm = async (e) => {
    e.preventDefault()
    setEditError('')
    setEditSuccess('')

    if (
      !editFormData.first_name ||
      !editFormData.last_name ||
      !editFormData.email ||
      !editFormData.phone ||
      !editFormData.date_of_birth ||
      !editFormData.gender ||
      !editFormData.student_id ||
      !editFormData.course ||
      !editFormData.level ||
      !editFormData.enrollment_date
    ) {
      setEditError('All fields are required')
      return
    }

    setEditSubmitting(true)

    api
      .put(`students/${editStudent.id}/update/`, editFormData)
      .then((response) => {
        setEditSuccess('Student updated successfully!')
        setTimeout(() => {
          setShowEditModal(false)
          fetchStudents()
        }, 1500)
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.email?.[0] ||
          error.response?.data?.student_id?.[0] ||
          'Failed to update student'
        setEditError(errorMsg)
      })
      .finally(() => {
        setEditSubmitting(false)
      })
  }

  // ===== DELETE STUDENT =====
  const handleDeleteStudent = (student) => {
    setDeleteStudent(student)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setDeleting(true)

    api
      .delete(`students/${deleteStudent.id}/delete/`)
      .then((response) => {
        setShowDeleteConfirm(false)
        setDeleteStudent(null)
        fetchStudents()
      })
      .catch((error) => {
        console.error('Error deleting student:', error)
        setDeleting(false)
      })
  }

  // ===== PAGE COMPONENTS =====

  // Dashboard Page
  const DashboardPage = () => (
    <div className="page-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Welcome back, Admin</p>
      </div>

      <div className="statistics-container">
        <div className="stat-card">
          <div className="stat-icon">
            <MdPeople />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Students</p>
            <p className="stat-value">
              {loading ? '...' : stats.totalStudents}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Students</p>
            <p className="stat-value">
              {loading ? '...' : stats.activeStudents}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdCancel />
          </div>
          <div className="stat-content">
            <p className="stat-label">Inactive Students</p>
            <p className="stat-value">
              {loading ? '...' : stats.inactiveStudents}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdBook />
          </div>
          <div className="stat-content">
            <p className="stat-label">Courses</p>
            <p className="stat-value">
              {loading ? '...' : stats.courses}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Students Page
  const StudentsPage = () => (
    <div className="page-content">
      <div className="page-header">
        <h1>Students</h1>
        <p className="page-subtitle">Manage all student records</p>
      </div>

      {/* Filter Panel */}
      <div className="filter-panel">
        <div className="filter-header">
          <h3 className="filter-title">Filters</h3>
          {(filterStatus !== 'all' || filterCourse || filterLevel) && (
            <button className="btn-reset-filters" onClick={resetFilters}>
              Clear All
            </button>
          )}
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilterStatus('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Course</label>
          <select
            className="filter-select"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Level</label>
          <select
            className="filter-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {uniqueLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="table-section">
        <div className="table-header">
          <div>
            <h2 className="table-title">Student Records</h2>
            <p className="table-subtitle">
              {filteredStudents.length} of {students.length} students
            </p>
          </div>
          <button
            className="btn-add-student"
            onClick={() => setCurrentPage('add-student')}
          >
            <MdAdd /> Add Student
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>No students found</p>
            <p className="empty-message">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by adding your first student.'}
            </p>
            <button
              className="btn-empty-add"
              onClick={() => setCurrentPage('add-student')}
            >
              <MdAdd /> Add Student
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td className="name-cell">
                      {student.first_name} {student.last_name}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.course}</td>
                    <td>{student.level}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          student.is_active ? 'active' : 'inactive'
                        }`}
                      >
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        title="View"
                        onClick={() => handleViewStudent(student)}
                      >
                        <MdVisibility />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEditStudent(student)}
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDeleteStudent(student)}
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  // Add Student Page
  const AddStudentPage = () => (
    <div className="page-content">
      <div className="page-header">
        <h1>Add New Student</h1>
        <p className="page-subtitle">Fill in the details to add a new student</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmitForm} className="add-student-form">
          {formError && <div className="form-error">{formError}</div>}
          {formSuccess && <div className="form-success">{formSuccess}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Doe"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="234-567-8900"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                placeholder="STU-2024-001"
              />
            </div>

            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="Computer Science"
              />
            </div>

            <div className="form-group">
              <label>Level</label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label>Enrollment Date</label>
              <input
                type="date"
                name="enrollment_date"
                value={formData.enrollment_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              Active Student
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setCurrentPage('students')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  // Settings Page
  const SettingsPage = () => (
    <div className="page-content">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="page-subtitle">Configure application preferences</p>
      </div>

      <div className="settings-card">
        <div className="settings-item">
          <div className="settings-info">
            <h3>Dark Mode</h3>
            <p>Toggle between dark and light theme</p>
          </div>
          <button
            className="btn-settings-toggle"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <MdSunny /> : <MdDarkMode />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <h3>Current Theme</h3>
            <p className="settings-value">
              {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
            </p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <h3>Total Students</h3>
            <p className="settings-value">{stats.totalStudents} students</p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <h3>Database</h3>
            <p className="settings-value">SQLite</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ===== RENDER =====

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>SMS</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <MdMenu /> : <MdMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('dashboard')
              setSidebarOpen(false)
            }}
          >
            <MdDashboard className="nav-icon" />
            <span className="nav-label">Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'students' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('students')
              setSidebarOpen(false)
            }}
          >
            <MdPeople className="nav-icon" />
            <span className="nav-label">Students</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'add-student' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('add-student')
              setSidebarOpen(false)
            }}
          >
            <MdPersonAdd className="nav-icon" />
            <span className="nav-label">Add Student</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('settings')
              setSidebarOpen(false)
            }}
          >
            <MdSettings className="nav-icon" />
            <span className="nav-label">Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout">
            <MdLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button
              className="btn-sidebar-toggle-mobile"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MdMenu />
            </button>
          </div>
          <div className="header-right">
            {currentPage === 'students' && (
              <div className="search-wrapper">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="search-bar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'dark' ? <MdSunny /> : <MdDarkMode />}
            </button>
            <div className="user-profile">
              <div className="profile-avatar">A</div>
              <span className="profile-name">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'students' && <StudentsPage />}
        {currentPage === 'add-student' && <AddStudentPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      {/* Modals */}
      {/* View Student Modal */}
      {showViewModal && viewStudent && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="view-student-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <p className="detail-label">First Name</p>
                  <p className="detail-value">{viewStudent.first_name}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Last Name</p>
                  <p className="detail-value">{viewStudent.last_name}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Email</p>
                  <p className="detail-value">{viewStudent.email}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Phone</p>
                  <p className="detail-value">{viewStudent.phone}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Date of Birth</p>
                  <p className="detail-value">{viewStudent.date_of_birth}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Gender</p>
                  <p className="detail-value">{viewStudent.gender}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Student ID</p>
                  <p className="detail-value">{viewStudent.student_id}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Course</p>
                  <p className="detail-value">{viewStudent.course}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Level</p>
                  <p className="detail-value">{viewStudent.level}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Enrollment Date</p>
                  <p className="detail-value">{viewStudent.enrollment_date}</p>
                </div>
                <div className="detail-item">
                  <p className="detail-label">Status</p>
                  <span
                    className={`status-badge ${
                      viewStudent.is_active ? 'active' : 'inactive'
                    }`}
                  >
                    {viewStudent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="detail-actions">
                <button
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editStudent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSubmitEditForm} className="add-student-form">
              {editError && <div className="form-error">{editError}</div>}
              {editSuccess && <div className="form-success">{editSuccess}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editFormData.first_name}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editFormData.last_name}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editFormData.date_of_birth}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={editFormData.gender}
                    onChange={handleEditInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={editFormData.student_id}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Course</label>
                  <input
                    type="text"
                    name="course"
                    value={editFormData.course}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <input
                    type="text"
                    name="level"
                    value={editFormData.level}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Enrollment Date</label>
                  <input
                    type="date"
                    name="enrollment_date"
                    value={editFormData.enrollment_date}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>

              <div className="form-group-full">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editFormData.is_active}
                    onChange={handleEditInputChange}
                  />
                  Active Student
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteStudent && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Student</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="delete-confirmation">
              <p>Are you sure you want to delete this student?</p>
              <p className="student-name">
                {deleteStudent.first_name} {deleteStudent.last_name}
              </p>
              <p className="warning">This action cannot be undone.</p>

              <div className="confirm-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App