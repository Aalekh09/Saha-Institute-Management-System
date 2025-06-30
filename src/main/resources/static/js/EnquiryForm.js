import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = window.location.protocol + '//' + window.location.hostname + ':4455';

const EnquiryForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        fatherName: '',
        dateOfEnquiry: '',
        phoneNumber: '',
        course: '',
        courseDuration: '',
        remarks: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/api/enquiries`, formData);
            setFormData({
                name: '',
                fatherName: '',
                dateOfEnquiry: '',
                phoneNumber: '',
                course: '',
                courseDuration: '',
                remarks: ''
            });
            alert('Enquiry submitted successfully!');
        } catch (error) {
            console.error('Error submitting enquiry:', error);
            alert('Error submitting enquiry. Please try again.');
        }
    };

    return (
        <div className="container mt-4">
            <h2>New Enquiry</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="fatherName" className="form-label">Father's Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="fatherName"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfEnquiry" className="form-label">Date of Enquiry</label>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfEnquiry"
                        name="dateOfEnquiry"
                        value={formData.dateOfEnquiry}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        className="form-control"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="course" className="form-label">Course Interested In</label>
                    <select
                        className="form-control"
                        id="course"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Course</option>
                        <option value="Basic Computer">Basic Computer</option>
                        <option value="MS Office">MS Office</option>
                        <option value="Tally">Tally</option>
                        <option value="DTP">DTP</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Programming">Programming</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Spoken English">Spoken English</option>
                        <option value="AutoCAD">AutoCAD</option>
                        <option value="DCAA">DCAA</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="courseDuration" className="form-label">Preferred Duration</label>
                    <select
                        className="form-control"
                        id="courseDuration"
                        name="courseDuration"
                        value={formData.courseDuration}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Duration</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="remarks" className="form-label">Remarks</label>
                    <textarea
                        className="form-control"
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit Enquiry</button>
            </form>
        </div>
    );
};

export default EnquiryForm; 