import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EnquiryList = () => {
    const [enquiries, setEnquiries] = useState([]);

    const fetchEnquiries = async () => {
        try {
            const response = await axios.get('http://localhost:4455/api/enquiries');
            setEnquiries(response.data);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleConvertToStudent = async (id) => {
        try {
            await axios.post(`http://localhost:4455/api/enquiries/${id}/convert`);
            fetchEnquiries(); // Refresh the list
            alert('Enquiry converted to student successfully!');
        } catch (error) {
            console.error('Error converting enquiry:', error);
            alert('Error converting enquiry. Please try again.');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Enquiries List</h2>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Father's Name</th>
                            <th>Date of Enquiry</th>
                            <th>Phone Number</th>
                            <th>Course</th>
                            <th>Duration</th>
                            <th>Remarks</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enquiries.map((enquiry) => (
                            <tr key={enquiry.id}>
                                <td>{enquiry.name}</td>
                                <td>{enquiry.fatherName || ''}</td>
                                <td>{new Date(enquiry.dateOfEnquiry).toLocaleDateString()}</td>
                                <td>{enquiry.phoneNumber}</td>
                                <td>{enquiry.course || ''}</td>
                                <td>{enquiry.courseDuration || ''}</td>
                                <td>{enquiry.remarks}</td>
                                <td>
                                    {enquiry.convertedToStudent ? (
                                        <span className="badge bg-success">Converted</span>
                                    ) : (
                                        <span className="badge bg-warning">Pending</span>
                                    )}
                                </td>
                                <td>
                                    {!enquiry.convertedToStudent && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleConvertToStudent(enquiry.id)}
                                        >
                                            Convert to Student
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnquiryList; 