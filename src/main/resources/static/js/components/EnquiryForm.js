import React, { useState } from 'react';
import axios from 'axios';

const EnquiryForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        dateOfEnquiry: '',
        phoneNumber: '',
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
            await axios.post('http://localhost:4455/api/enquiries', formData);
            setFormData({
                name: '',
                dateOfEnquiry: '',
                phoneNumber: '',
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