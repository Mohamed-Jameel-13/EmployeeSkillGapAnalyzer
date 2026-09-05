package com.skillgap.dto;

public class ApplicationRequest {
    private Integer studentId;
    private Integer jobId;

    public ApplicationRequest() {
    }

    public ApplicationRequest(Integer studentId, Integer jobId) {
        this.studentId = studentId;
        this.jobId = jobId;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public Integer getJobId() {
        return jobId;
    }

    public void setJobId(Integer jobId) {
        this.jobId = jobId;
    }
}
