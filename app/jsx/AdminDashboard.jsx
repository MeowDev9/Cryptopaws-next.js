"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import "../styles/AdminDashboard.css"

const AdminDashboard = () => {
  const [welfareRequests, setWelfareRequests] = useState([])

  // Fetch pending welfare requests
  useEffect(() => {
    const fetchWelfareRequests = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        if (!token) {
          alert("Session expired. Please log in again.")
          localStorage.removeItem("adminToken")
          window.location.href = "/login" // Redirect to login
          return
        }
        const response = await axios.get("http://localhost:5001/api/admin/organizations/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setWelfareRequests(response.data)
      } catch (error) {
        console.error("Error fetching welfare requests:", error)
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.")
          localStorage.removeItem("adminToken")
          window.location.href = "/login" // Redirect to login
        }
      }
    }

    fetchWelfareRequests()
  }, [])

  // Handle approve
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        console.error("No token found. Please log in again.")
        return
      }

      const response = await axios.post(
        `http://localhost:5001/api/admin/organizations/${id}/approve`,
        {}, // No body needed for approval
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the UI after approval
      setWelfareRequests(welfareRequests.filter((request) => request._id !== id))
      alert(response.data.message || "Welfare approved successfully!")
    } catch (error) {
      console.error("Error approving welfare:", error)
      alert(error.response?.data?.message || "Failed to approve welfare.")
    }
  }

  // Handle reject
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        console.error("No token found. Please log in again.")
        return
      }

      const response = await axios.post(
        `http://localhost:5001/api/admin/organizations/${id}/reject`,
        {}, // No body needed for rejection
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the UI after rejection
      setWelfareRequests(welfareRequests.filter((request) => request._id !== id))
      alert(response.data.message || "Welfare rejected successfully!")
    } catch (error) {
      console.error("Error rejecting welfare:", error)
      alert(error.response?.data?.message || "Failed to reject welfare.")
    }
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-dashboard-sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li>Welfare Requests</li>
          <li>Donations</li>
          <li>Adoptions</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="admin-dashboard-main-content">
        <h2>Pending Welfare Requests</h2>
        <table className="admin-dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Description</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {welfareRequests.map((request) => (
              <tr key={request._id}>
                <td>{request.name}</td>
                <td>{request.email}</td>
                <td>{request.phone}</td>
                <td>{request.address}</td>
                <td>{request.description}</td>
                <td>{request.website}</td>
                <td>
                  <button className="admin-dashboard-approve-btn" onClick={() => handleApprove(request._id)}>
                    Approve
                  </button>
                  <button className="admin-dashboard-reject-btn" onClick={() => handleReject(request._id)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard