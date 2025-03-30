// import React, { useState, useEffect } from 'react';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import './styles/UserProfile.css';

// const UserProfile = () => {
//   const { userId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   // Function to fetch user data
//   const fetchUserData = () => {
//     fetch(`http://localhost:8080/user/${userId}`)
//       .then(response => response.json())
//       .then(data => {
//         setUserData(data);
//         setFormData({
//           name: data.name,
//           email: data.email,
//           password: data.password || ''
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching user data:', error);
//       });
//   };

//   useEffect(() => {
//     // Try to get userData from location state first
//     if (location.state && location.state.userData) {
//       setUserData(location.state.userData);
//       setFormData({
//         name: location.state.userData.name,
//         email: location.state.userData.email,
//         password: location.state.userData.password || ''
//       });
//     } else {
//       // If not available in state, fetch from API
//       fetchUserData();
//     }
//   }, [userId, location]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   // Generate a string of bullets matching the password length
//   const getMaskedPassword = (password) => {
//     return '\u2022'.repeat(password ? password.length : 6);
//   };

//   const handleEdit = () => {
//     if (isEditing) {
//       // Save changes
//       const updatedData = {
//         ...userData,
//         name: formData.name,
//         email: formData.email,
//         password: formData.password
//       };

//       fetch(`http://localhost:8080/editUser/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updatedData)
//       })
//         .then(response => {
//           if (!response.ok) {
//             throw new Error('Failed to update profile');
//           }
//           return response.json();
//         })
//         .then(data => {
//           // Update both userData and formData with the response from the server
//           setUserData(data);
//           setFormData({
//             name: data.name,
//             email: data.email,
//             password: data.password || formData.password
//           });
//           setIsEditing(false);
//           setShowPassword(false);
//           alert('Profile updated successfully!');
//         })
//         .catch(error => {
//           console.error('Error updating profile:', error);
//           // If there's an error, refresh the data from the server
//           fetchUserData();
//           alert('Failed to update profile: ' + error.message);
//         });
//     } else {
//       // Enter edit mode
//       setIsEditing(true);
//     }
//   };

//   const handleDelete = () => {
//     if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
//       fetch(`http://localhost:8080/users/${userId}`, {
//         method: 'DELETE',
//       })
//         .then(response => {
//           if (response.ok) {
//             localStorage.removeItem('userId');
//             localStorage.removeItem('token');
//             alert('Profile deleted successfully');
//             navigate('/login');
//           } else {
//             throw new Error('Failed to delete profile');
//           }
//         })
//         .catch(error => {
//           console.error('Error:', error);
//           alert('Failed to delete profile');
//         });
//     }
//   };

//   // Check if the logged-in user is viewing their own profile
//   const loggedInUserId = localStorage.getItem('userId');
//   const isOwnProfile = loggedInUserId === userId;

//   if (!userData) {
//     return <div className="user-profile-container">Loading...</div>;
//   }

//   return (
//     <div className="user-profile-container">
//       <div className="user-profile-card">
//         <h1>User Details</h1>
        
//         <div className="profile-field">
//           <label>Name:</label>
//           <div className="field-value">
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             ) : (
//               <span>{userData.name}</span>
//             )}
//           </div>
//         </div>
        
//         <div className="profile-field">
//           <label>Email:</label>
//           <div className="field-value">
//             {isEditing ? (
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             ) : (
//               <span>{userData.email}</span>
//             )}
//           </div>
//         </div>
        
//         {isOwnProfile && (
//           <div className="profile-field">
//             <label>Password:</label>
//             <div className="field-value password-field">
//               {isEditing ? (
//                 <div className="password-input-container">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                   />
//                   <span 
//                     className="eye-icon"
//                     onClick={togglePasswordVisibility}
//                   >
//                     {showPassword ? (
//                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
//                         <path fill="currentColor" d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084l-1.442-1.442a4.5 4.5 0 0 1 6.33 6.33l-1.442-1.442a2.5 2.5 0 0 0-3.446-3.446z"/>
//                       </svg>
//                     ) : (
//                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
//                         <path fill="currentColor" d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
//                       </svg>
//                     )}
//                   </span>
//                 </div>
//               ) : (
//                 <div className="password-display">
//                   <span>
//                     {showPassword ? formData.password : getMaskedPassword(formData.password)}
//                   </span>
//                   <span 
//                     className="eye-icon"
//                     onClick={togglePasswordVisibility}
//                   >
//                     {showPassword ? (
//                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
//                         <path fill="currentColor" d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084l-1.442-1.442a4.5 4.5 0 0 1 6.33 6.33l-1.442-1.442a2.5 2.5 0 0 0-3.446-3.446z"/>
//                       </svg>
//                     ) : (
//                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
//                         <path fill="currentColor" d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
//                       </svg>
//                     )}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
        
//         {isOwnProfile && (
//           <div className="profile-actions">
//             <button 
//               className={`edit-button ${isEditing ? 'save-button' : ''}`}
//               onClick={handleEdit}
//             >
//               {isEditing ? 'Save' : 'Edit Profile'}
//             </button>
            
//             <button 
//               className="delete-button"
//               onClick={handleDelete}
//             >
//               Delete Profile
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfile;

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './styles/UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Function to fetch user data
  const fetchUserData = () => {
    fetch(`http://localhost:8080/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        setFormData({
          name: data.name,
          email: data.email,
          password: data.password || ''
        });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  };

  useEffect(() => {
    // Try to get userData from location state first
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setFormData({
        name: location.state.userData.name,
        email: location.state.userData.email,
        password: location.state.userData.password || ''
      });
    } else {
      // If not available in state, fetch from API
      fetchUserData();
    }
  }, [userId, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Generate a string of bullets matching the password length
  const getMaskedPassword = (password) => {
    return '\u2022'.repeat(password ? password.length : 6);
  };

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      const updatedData = {
        ...userData,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      fetch(`http://localhost:8080/editUser/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update profile');
          }
          return response.json();
        })
        .then(() => {
          // After successful update, fetch fresh data from the server
          fetchUserData();
          setIsEditing(false);
          setShowPassword(false);
          alert('Profile updated successfully!');
        })
        .catch(error => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile: ' + error.message);
        });
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      fetch(`http://localhost:8080/users/${userId}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.ok) {
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            alert('Profile deleted successfully');
            navigate('/login');
          } else {
            throw new Error('Failed to delete profile');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to delete profile');
        });
    }
  };

  // Check if the logged-in user is viewing their own profile
  const loggedInUserId = localStorage.getItem('userId');
  const isOwnProfile = loggedInUserId === userId;

  if (!userData) {
    return <div className="user-profile-container">Loading...</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <h1>User Details</h1>
        
        <div className="profile-field">
          <label>Name:</label>
          <div className="field-value">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <span>{userData.name}</span>
            )}
          </div>
        </div>
        
        <div className="profile-field">
          <label>Email:</label>
          <div className="field-value">
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            ) : (
              <span>{userData.email}</span>
            )}
          </div>
        </div>
        
        {isOwnProfile && (
          <div className="profile-field">
            <label>Password:</label>
            <div className="field-value password-field">
              {isEditing ? (
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span 
                    className="eye-icon"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084l-1.442-1.442a4.5 4.5 0 0 1 6.33 6.33l-1.442-1.442a2.5 2.5 0 0 0-3.446-3.446z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                      </svg>
                    )}
                  </span>
                </div>
              ) : (
                <div className="password-display">
                  <span>
                    {showPassword ? formData.password : getMaskedPassword(formData.password)}
                  </span>
                  <span 
                    className="eye-icon"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084l-1.442-1.442a4.5 4.5 0 0 1 6.33 6.33l-1.442-1.442a2.5 2.5 0 0 0-3.446-3.446z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                      </svg>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isOwnProfile && (
          <div className="profile-actions">
            <button 
              className={`edit-button ${isEditing ? 'save-button' : ''}`}
              onClick={handleEdit}
            >
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
            
            <button 
              className="delete-button"
              onClick={handleDelete}
            >
              Delete Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;