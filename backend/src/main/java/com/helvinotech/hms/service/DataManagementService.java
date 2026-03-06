package com.helvinotech.hms.service;

import com.helvinotech.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DataManagementService {

    private final NursingNoteRepository nursingNoteRepository;
    private final ImagingOrderRepository imagingOrderRepository;
    private final LabOrderRepository labOrderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final BillingItemRepository billingItemRepository;
    private final PaymentRepository paymentRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final BillingRepository billingRepository;
    private final AdmissionRepository admissionRepository;
    private final VisitRepository visitRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;
    private final WardRepository wardRepository;
    private final ExpenseRepository expenseRepository;

    /** Clear all patient records and everything clinically linked to them. */
    @Transactional
    public int clearAllClinicalData() {
        // Delete in FK dependency order (children first)
        nursingNoteRepository.deleteAllInBatch();
        imagingOrderRepository.deleteAllInBatch();
        labOrderRepository.deleteAllInBatch();
        prescriptionRepository.deleteAllInBatch();
        billingItemRepository.deleteAllInBatch();
        paymentRepository.deleteAllInBatch();
        insuranceClaimRepository.deleteAllInBatch();
        billingRepository.deleteAllInBatch();
        admissionRepository.deleteAllInBatch();
        visitRepository.deleteAllInBatch();
        appointmentRepository.deleteAllInBatch();
        long count = patientRepository.count();
        patientRepository.deleteAllInBatch();
        return (int) count;
    }

    /** Clear all ward, room, and bed records (along with admissions and nursing notes referencing them). */
    @Transactional
    public int clearWardsAndBeds() {
        nursingNoteRepository.deleteAllInBatch();
        admissionRepository.deleteAllInBatch();
        bedRepository.deleteAllInBatch();
        roomRepository.deleteAllInBatch();
        long count = wardRepository.count();
        wardRepository.deleteAllInBatch();
        return (int) count;
    }

    /** Clear all billing records (invoices, payments, insurance claims, line items). */
    @Transactional
    public int clearBillingData() {
        billingItemRepository.deleteAllInBatch();
        paymentRepository.deleteAllInBatch();
        insuranceClaimRepository.deleteAllInBatch();
        long count = billingRepository.count();
        billingRepository.deleteAllInBatch();
        return (int) count;
    }

    /** Clear all appointments. */
    @Transactional
    public int clearAppointments() {
        long count = appointmentRepository.count();
        appointmentRepository.deleteAllInBatch();
        return (int) count;
    }

    /** Clear all expense records. */
    @Transactional
    public int clearExpenses() {
        long count = expenseRepository.count();
        expenseRepository.deleteAllInBatch();
        return (int) count;
    }
}
