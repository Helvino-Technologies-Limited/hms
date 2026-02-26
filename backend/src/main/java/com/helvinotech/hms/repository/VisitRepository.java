package com.helvinotech.hms.repository;

import com.helvinotech.hms.entity.Visit;
import com.helvinotech.hms.enums.LabOrderStatus;
import com.helvinotech.hms.enums.TriageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    Page<Visit> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
    List<Visit> findByDoctorIdAndCompletedFalseOrderByCreatedAtAsc(Long doctorId);
    Page<Visit> findByDoctorIdOrderByCreatedAtDesc(Long doctorId, Pageable pageable);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Visit> findByCompletedFalseOrderByCreatedAtAsc();

    // Triage queue: visits awaiting triage or triaged and waiting for doctor
    List<Visit> findByTriageStatusInAndCompletedFalseOrderByCreatedAtAsc(List<TriageStatus> statuses);

    // Visits with released lab results that haven't been reviewed (still PENDING_LAB_REVIEW)
    @Query("SELECT DISTINCT v FROM Visit v JOIN v.labOrders lo WHERE lo.status = :status AND v.completed = false AND v.triageStatus = :triageStatus")
    List<Visit> findVisitsWithReleasedLabResults(@Param("status") LabOrderStatus status, @Param("triageStatus") TriageStatus triageStatus);
}
