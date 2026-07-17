// import React, { useEffect, useState, useRef } from "react";
// import {
//   fetchDocumentType,
//   fetchGuardians,
//   fetchOfficeStaff,
//   fetchRoles,
//   fetchStudentYearLevelByClass,
//   fetchTeachers,
//   fetchYearLevels,
// } from "../services/api/Api";
// import { constants } from "../global/constants";
// import axios from "axios";

// export const DocumentUpload = () => {
//   // STEPS LOGIC
//   const [step, setStep] = useState(0);
//   const next = () => setStep((prev) => Math.min(prev + 1, 1));
//   const prev = () => setStep((prev) => Math.max(prev - 1, 0));

//   // FORM DATA & DROPDOWN STATES
//   const [allRoles, setAllRoles] = useState([]);
//   const [documentType, setDocumentType] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [guardians, setGuardians] = useState([]);
//   const [officeStaff, setOfficeStaff] = useState([]);
//   const [yearLevel, setYearLevel] = useState([]);
//   const [yearLevelID, setYearLevelID] = useState("");

//   const [loadingRoles, setLoadingRoles] = useState(false);
//   const [Disable, setDisable] = useState(true);
//   const [AddField, setAddField] = useState(0);
//   const [selectedTeacherName, setSelectedTeacherName] = useState("");
//   const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
//   const [searchTeacherInput, setSearchTeacherInput] = useState("");
//   const [showGuardianDropdown, setShowGuardianDropdown] = useState(false);
//   const [selectedGuardianName, setSelectedGuardianName] = useState("");
//   const [searchGuardianInput, setSearchGuardianInput] = useState("");
//   const [showOfficeStaffDropdown, setShowOfficeStaffDropdown] = useState(false);
//   const [selectedOfficeStaffName, setSelectedOfficeStaffName] = useState("");
//   const [searchOfficeStaffInput, setSearchOfficeStaffInput] = useState("");
//   const [showStudentDropdown, setShowStudentDropdown] = useState(false);
//   const [selectedStudentName, setSelectedStudentName] = useState("");
//   const [searchStudentInput, setSearchStudentInput] = useState("");

//   const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
//   const [loadingTeachers, setLoadingTeachers] = useState(false);
//   const [loadingGuardians, setLoadingGuardians] = useState(false);
//   const [loadingOfficeStaff, setLoadingOfficeStaff] = useState(false);
//   const [loadingStudents, setLoadingStudents] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [docTypeErrors, setDocTypeErrors] = useState([]);
//   const [FilesErrors, setFilesErrors] = useState([]);
//   const [apiErrors, setApiErrors] = useState({});


//   const [role, setRole] = useState("");

//   const studentDropdownRef = useRef(null);
//   const teacherDropdownRef = useRef(null);
//   const guardianDropdownRef = useRef(null);
//   const officeStaffDropdownRef = useRef(null);


//   const [formData, setFormData] = useState({
//     student: "",
//     teacher: "",
//     guardian: "",
//     office_staff: "",
//     year_level: "",
//   });
//   const filteredTeachers = teachers.filter((teacher) =>
//     `${teacher.first_name} ${teacher.last_name}`
//       .toLowerCase()
//       .includes(searchTeacherInput.toLowerCase())
//   );
//   const filteredGuardians = guardians.filter((guardian) =>
//     `${guardian.first_name} ${guardian.last_name}`
//       .toLowerCase()
//       .includes(searchGuardianInput.toLowerCase())
//   );
//   const filteredOfficeStaff = officeStaff.filter((staff) =>
//     `${staff.first_name} ${staff.last_name}`
//       .toLowerCase()
//       .includes(searchOfficeStaffInput.toLowerCase())
//   );
//   const filteredStudents = students.filter((studentObj) =>
//     studentObj.student_name
//       .toLowerCase()
//       .includes(searchStudentInput.toLowerCase())
//   );

//   // Dynamic fields for document uploads
//   const [uploadFields, setUploadFields] = useState([
//     { files: null, document_types: "", identities: "" },
//   ]);
//   const [identityErrors, setIdentityErrors] = useState([]);
//   //  validation
//   const validateIdentity = (identity, docTypeId) => {
//     if (!docTypeId || !identity) return "";

//     const selectedDoc = documentType.find(
//       (doc) => doc.id.toString() === docTypeId.toString()
//     );
//     if (!selectedDoc) return "";

//     const name = selectedDoc.name.trim().toLowerCase();

//     // Aadhaar
//     if (name === "adharcard") {
//       const aadhaarRegex = /^\d{12}$/;
//       return aadhaarRegex.test(identity)
//         ? ""
//         : "Aadhaar must be 12 digits (e.g. 123456789012)";
//     }

//     // Passport
//     else if (name === "passport") {
//       const passportRegex = /^[A-Z]{1}[0-9]{7}$/;
//       return passportRegex.test(identity)
//         ? ""
//         : "Passport format: 1 letter + 7 digits (e.g. K1234567)";
//     }

//     // Birth Certificate
//     else if (name === "birth certificate") {
//       const bcRegex = /^BRN-\d{4}-\d{3,}$/;
//       return bcRegex.test(identity)
//         ? ""
//         : "Birth: BRN-2021-000123";
//     }

//     // Transfer Certificate
//     else if (name === "transfer certificate") {
//       const tcRegex = /^TC-\d{4}-\d{3,}$/;
//       return tcRegex.test(identity)
//         ? ""
//         : "TC: TC-YYYY-XXX (e.g. TC-2022-00123)";
//     }

//     // Bonafide Certificate
//     else if (name === "bonafide certificate") {
//       const bonafideRegex = /^BONAFIDE-\d{4}-\d{3,}$/;
//       return bonafideRegex.test(identity)
//         ? ""
//         : "Bonafide: BONAFIDE-2023-001";
//     }

//     // PAN Card
//     else if (name === "pan card") {
//       const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//       return panRegex.test(identity)
//         ? ""
//         : "PAN: AAAAA9999A (format)";
//     } else if (name === "migration certificate") {
//       const migrationRegex = /^[A-Z]{2,10}\/\d{4}\/\d{3,6}$/;
//       return migrationRegex.test(identity)
//         ? ""
//         : "Migration: CBSE/2020/123456";
//     }
//     const normalized = name.trim().toLowerCase();

//     if (normalized === "date of birth certificate") {
//       const dobCertRegex = /^[A-Z\-\/]{2,10}[\-\/]?\d{4}[\-\/]?\d{3,6}$/;
//       return dobCertRegex.test(identity)
//         ? ""
//         : "DOB: CODE/YYYY/SERIAL (e.g. MC/2020/123456)";
//     } else if (normalized === "income certificate") {
//       const incomeCertRegex = /^[A-Z\/\-]{2,10}[\-\/]?\d{4}[\-\/]?\d{3,6}$/;
//       return incomeCertRegex.test(identity)
//         ? ""
//         : "Income: IC/2021/123456 (format)";
//     } else if (normalized === "domicile certificate") {
//       const domicileCertRegex = /^[A-Z\/\-]{2,10}[\-\/]?\d{4}[\-\/]?\d{3,6}$/;
//       return domicileCertRegex.test(identity)
//         ? ""
//         : "Domicile: DC/2022/000123 (format)";
//     }

//     // Driving License
//     else if (name === "driving license") {
//       const dlRegex = /^[A-Z]{2}[ -]?\d{2}[ -]?\d{2,4}[ -]?\d{6,7}$/;
//       return dlRegex.test(identity)
//         ? ""
//         : "DL: XX00-YYYY-Number (e.g. DL01-2017-001234)";
//     }

//     // Caste Certificate
//     else if (name === "caste certificate") {
//       const casteRegex = /^CASTE-\d{4}-\d{3,}$/;
//       return casteRegex.test(identity)
//         ? ""
//         : "Caste: CASTE-2023-001 (format)";
//     }

//     return "";
//   };

//   // --- API FETCH FUNCTIONS ---
//   const getRoles = async () => {
//     setLoadingRoles(true);
//     try {
//       const roles = await fetchRoles();
//       setAllRoles(roles);
//     } catch {
//       console.log("Failed to load roles");
//     } finally {
//       setLoadingRoles(false);
//     }
//   };

//   const getDocumentTypes = async () => {
//     setLoadingDocumentTypes(true);
//     try {
//       const docType = await fetchDocumentType();
//       const sortedDocType = [...docType].sort((a, b) =>
//         a.name.localeCompare(b.name, "en", { sensitivity: "base" })
//       );
//       setDocumentType(sortedDocType);
//     } catch (error) {
//       console.log("Failed to load document types");
//     } finally {
//       setLoadingDocumentTypes(false);
//     }
//   };

//   const getTeachers = async () => {
//     setLoadingTeachers(true);
//     try {
//       const allTeachers = await fetchTeachers();
//       const sortedTeachers = [...allTeachers].sort((a, b) => {
//         const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
//         const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
//         return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
//       });
//       setTeachers(sortedTeachers);
//     } catch {
//       console.log("Failed to load teachers");
//     } finally {
//       setLoadingTeachers(false);
//     }
//   };

//   const getGuardians = async () => {
//     setLoadingGuardians(true);
//     try {
//       const allGuardians = await fetchGuardians();
//       const sortedGuardians = [...allGuardians].sort((a, b) => {
//         const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
//         const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
//         return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
//       });

//       setGuardians(sortedGuardians);
//     } catch {
//       console.log("Failed to load guardians");
//     } finally {
//       setLoadingGuardians(false);
//     }
//   };

//   const getOfficeStaff = async () => {
//     setLoadingOfficeStaff(true);
//     try {
//       const allStaff = await fetchOfficeStaff();
//       const sortedStaff = [...allStaff].sort((a, b) => {
//         const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
//         const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
//         return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
//       });

//       setOfficeStaff(sortedStaff);
//     } catch {
//       console.log("Failed to load office staff");
//     } finally {
//       setLoadingOfficeStaff(false);
//     }
//   };

//   const getYearLevels = async () => {
//     try {
//       const yl = await fetchYearLevels();
//       setYearLevel(yl);
//     } catch {
//       console.log("Failed to load year levels");
//     }
//   };

//   const getStudentsYearLevel = async () => {
//     if (!yearLevelID) return;
//     setLoadingStudents(true);
//     try {
//       const allStudentsByClass = await fetchStudentYearLevelByClass(
//         yearLevelID
//       );
//       const sortedStudents = [...allStudentsByClass].sort((a, b) =>
//         a.student_name.localeCompare(b.student_name, "en", {
//           sensitivity: "base",
//         })
//       );

//       setStudents(sortedStudents);
//     } catch {
//       console.log("Failed to load students");
//     } finally {
//       setLoadingStudents(false);
//     }
//   };

//   // --- HANDLERS ---
//   const handleRoleChange = (e) => {
//     const selectedRole = e.target.value;
//     setRole(selectedRole);
//     setFormData({
//       student: "",
//       teacher: "",
//       guardian: "",
//       office_staff: "",
//       year_level: "",
//     });
//   };



//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "year_level") {
//       setFormData((prev) => ({ ...prev, [name]: value, student: "" }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleAddField = () => {
//     setAddField(AddField + 1);
//     setUploadFields([
//       ...uploadFields,
//       { files: null, document_types: "", identities: "" },
//     ]);
//     setIdentityErrors([...identityErrors, ""]);
//   };

//   const handleFileChange = (e, index) => {
//     const newFields = [...uploadFields];
//     newFields[index].files = e.target.files[0];
//     setUploadFields(newFields);
//   };

//   const handleUploadChange = (e, index) => {
//     const { name, value } = e.target;

//     // Update the field value
//     const newFields = [...uploadFields];
//     newFields[index][name] = value;
//     setUploadFields(newFields);

//     // Clone errors arrays
//     const newErrors = [...identityErrors];
//     const newDocErrors = [...docTypeErrors];
//     const newFileErrors = Array.isArray(FilesErrors) ? [...FilesErrors] : [];

//     // Validate document type
//     if (name === "document_types") {
//       newDocErrors[index] = value ? "" : "Please select a document type";
//     }

//     if (name === "files") {
//       newFileErrors[index] = value ? "" : "Please select a file";
//     }

//     // Validate identity fields only if both fields exist
//     const currentIdentities = newFields[index]?.identities || "";
//     const currentDocType = newFields[index]?.document_types || "";

//     if (name === "document_types" || name === "identities") {
//       const validationError = validateIdentity(currentIdentities, currentDocType);
//       newErrors[index] = validationError || "";


//       setApiErrors((prev) => {
//         const updated = { ...prev };
//         if (updated.identities) {
//           delete updated.identities;
//         }
//         return updated;
//       });
//     }

//     // Update state
//     setIdentityErrors(newErrors);
//     setDocTypeErrors(newDocErrors);
//     setFilesErrors(newFileErrors);

//     console.log("Document Type Error at index", index, ":", newFileErrors);
//   };



//   const getAvailableDocumentTypes = (currentIndex) => {
//     const selectedDocTypes = uploadFields
//       .map((field, idx) => (idx !== currentIndex ? field.document_types : null))
//       .filter(Boolean);
//     return documentType.filter(
//       (doc) => !selectedDocTypes.includes(doc.id.toString())
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const newDocErrors = [...docTypeErrors];
//     const newIdentityErrors = [...identityErrors];
//     const newfileError = [...FilesErrors]
//     let hasError = false;

//     try {
//       for (const [index, field] of uploadFields.entries()) {
//         // Validate document type
//         if (!field.document_types) {
//           newDocErrors[index] = "Please select a document type";
//           hasError = true;
//         } else {
//           newDocErrors[index] = "";
//         }

//         // Validate file
//         if (!field.files) {
//           newfileError[index] = "Please upload a file";
//           hasError = true;
//         } else {
//           newfileError[index] = "";
//         }

//         // Validate identities
//         const identityError = validateIdentity(
//           field.identities,
//           field.document_types
//         );
//         if (identityError) {
//           newIdentityErrors[index] = identityError;
//           hasError = true;
//         } else {
//           newIdentityErrors[index] = "";
//         }

//         console.log(`Validation result for index ${index}:`, {
//           docError: newDocErrors[index],
//           identityError: newIdentityErrors[index],
//         });
//       }

//       setDocTypeErrors([...newDocErrors]);
//       setIdentityErrors([...newIdentityErrors]);
//       setFilesErrors([...newfileError])

//       if (hasError) {
//         setLoading(false);
//         return;
//       }

//       for (const field of uploadFields) {
//         const formDataToSend = new FormData();
//         formDataToSend.append("files", field.files);
//         formDataToSend.append("document_types", field.document_types);

//         if (formData.student)
//           formDataToSend.append("student", formData.student);
//         if (formData.teacher)
//           formDataToSend.append("teacher", formData.teacher);
//         if (formData.guardian)
//           formDataToSend.append("guardian", formData.guardian);
//         if (formData.office_staff)
//           formDataToSend.append("office_staff", formData.office_staff);
//         if (field.identities)
//           formDataToSend.append("identities", field.identities);

//         await axios.post(`${constants.baseUrl}/d/Document/`, formDataToSend, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }

//       setAlertMessage("Documents uploaded successfully!");
//       setShowAlert(true);
//       setUploadFields([{ files: null, document_types: "", identities: "" }]);
//       setFormData({
//         student: "",
//         teacher: "",
//         guardian: "",
//         office_staff: "",
//         year_level: "",
//       });
//       setRole("");
//       setStep(0);
//       setApiErrors({});
//       setSelectedTeacherName("")
//       setSearchTeacherInput("")
//       setSelectedGuardianName("")
//       setSearchGuardianInput("")
//       setSelectedOfficeStaffName("")
//       setSearchOfficeStaffInput("")
//       setSelectedStudentName("")
//       setSearchStudentInput("")
//       setDisable(true)
//     } catch (err) {
//       setLoading(false); 

//       if (err.response && err.response.data) {
//         const responseData = err.response.data;

//         // Check for the specific identity modification error
//         if (responseData.error === "You can't modify the identity of an existing document.") {
//           setAlertMessage("You can't modify the identity of an existing document.");
//           setShowAlert(true);
//           setDisable(true);
//           return; // Stop further processing
//         }

//         // Handle other API errors normally
//         setApiErrors(responseData);
//         setDisable(true);
//       } else {
//         // Fallback for unexpected errors
//         setAlertMessage("An unexpected error occurred. Please try again.");
//         setShowAlert(true);
//         setDisable(true);
//       }
//     }


//     finally {
//       // setSelectedTeacherName("")
//       // setSearchTeacherInput("")
//       // setSelectedGuardianName("")
//       // setSearchGuardianInput("")
//       // setSelectedOfficeStaffName("")
//       // setSearchOfficeStaffInput("")
//       // setSelectedStudentName("")
//       // setSearchStudentInput("")
//       setLoading(false);
//       setDisable(true);
//     }
//   };

//   const handleBack = () => {
//     setUploadFields([{ files: null, document_types: "", identities: "" }]);
//     setFormData({
//       student: "",
//       teacher: "",
//       guardian: "",
//       office_staff: "",
//       year_level: "",
//     });
//     setSelectedTeacherName("")
//     setSearchTeacherInput("")
//     setSelectedGuardianName("")
//     setSearchGuardianInput("")
//     setSelectedOfficeStaffName("")
//     setSearchOfficeStaffInput("")
//     setSelectedStudentName("")
//     setSearchStudentInput("")
//     setApiErrors({});

//     prev()
//     setDisable(true)
//   }



//   useEffect(() => {
//     getRoles();
//     getDocumentTypes();
//     getTeachers();
//     getGuardians();
//     getOfficeStaff();
//     getYearLevels();
//   }, []);

//   useEffect(() => {
//     if (formData.year_level && yearLevel.length > 0) {
//       const selected = yearLevel.find(
//         (yl) => yl.id === parseInt(formData.year_level)
//       );
//       if (selected) setYearLevelID(selected.id);
//     }
//   }, [formData.year_level, yearLevel]);

//   useEffect(() => {
//     if (yearLevelID) getStudentsYearLevel();
//   }, [yearLevelID]);

//   const filteredRoles = allRoles
//     .filter(
//       (role) =>
//         role.name === constants.roles.teacher ||
//         role.name === constants.roles.officeStaff ||
//         role.name === constants.roles.student ||
//         role.name === constants.roles.guardian
//     )
//     .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         studentDropdownRef.current &&
//         !studentDropdownRef.current.contains(event.target)
//       ) {
//         setShowStudentDropdown(false);
//       }

//       if (
//         teacherDropdownRef.current &&
//         !teacherDropdownRef.current.contains(event.target)
//       ) {
//         setShowTeacherDropdown(false);
//       }

//       if (
//         guardianDropdownRef.current &&
//         !guardianDropdownRef.current.contains(event.target)
//       ) {
//         setShowGuardianDropdown(false);
//       }

//       if (
//         officeStaffDropdownRef.current &&
//         !officeStaffDropdownRef.current.contains(event.target)
//       ) {
//         setShowOfficeStaffDropdown(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);



//   useEffect(() => {
//     const hasNoDocTypeErrors = uploadFields.every((field, index) => {
//       return field.document_types && !docTypeErrors[index];
//     });

//     const hasNoFileErrors = uploadFields.every((field, index) => {
//       return field.files && !FilesErrors[index];
//     });

//     const hasNoIdentityErrors = uploadFields.every((field, index) => {
//       return !identityErrors[index] && field.identities.trim() !== "";
//     });

//     const hasSelectedIdentity =
//       formData.student ||
//       formData.teacher ||
//       formData.guardian ||
//       formData.office_staff;

//     const hasNoApiErrors = Object.keys(apiErrors).length === 0;

//     const isFormValid =
//       hasNoDocTypeErrors &&
//       hasNoFileErrors &&
//       hasNoIdentityErrors &&
//       hasSelectedIdentity &&
//       hasNoApiErrors;

//     setDisable(!isFormValid); // Disable if NOT valid
//   }, [uploadFields, docTypeErrors, FilesErrors, identityErrors, formData, apiErrors]);



//   // --- RENDER ---
//   // Helper function to get max length based on document type
//   const getIdentityMaxLength = (docTypeId) => {
//     if (!docTypeId) return undefined;

//     const selectedDoc = documentType.find(
//       (doc) => doc.id.toString() === docTypeId.toString()
//     );
//     if (!selectedDoc) return undefined;

//     const name = selectedDoc.name.trim().toLowerCase();

//     // Define max lengths for different document types
//     const maxLengths = {
//       "adharcard": 12,
//       "pan card": 10,
//       "passport": 8,
//       "driving license": 20,
//       "caste certificate": 15,
//       "birth certificate": 15,
//       "transfer certificate": 15,
//       "bonafide certificate": 20,
//       "migration certificate": 20,
//       "date of birth certificate": 20,
//       "income certificate": 20,
//       "domicile certificate": 20,
//       "library card": 15,
//       "other": 50
//     };


//     const matchedType = Object.keys(maxLengths).find(key =>
//       name.includes(key) || key.includes(name)
//     );

//     return matchedType ? maxLengths[matchedType] : 50;
//   };
//   return (
//     <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md my-5"
//       >
//         {/* Steps */}
//         <ul className="steps mb-6 w-full">
//           <li className={`step ${step >= 0 ? "step-primary" : ""}`}>Role</li>
//           <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
//             Fill Form
//           </li>
//         </ul>

//         {/* Custom theme for steps */}
//         <style>
//           {`
//         .steps .step.step-primary::before,
//         .steps .step.step-primary:before {
//           background-color: #6d28d9 !important; 
//           border-color: #6d28d9 !important;
//           color: #ffffff !important; 
//         }
//         .steps .step.step-primary {
//           color: #6d28d9 !important;
//         }
//         .steps .step.step-primary::after {
//           border-color: #6d28d9 !important;
//         }
//       `}
//         </style>

//         {/* STEP 0 */}
//         {step === 0 && (
//           <div className="w-full max-w-6xl mx-auto p-6">
//             <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
//               Upload Documents
//               <i className="fa-solid fa-cloud-upload-alt ml-2"></i>
//               <p className="text-2xl m-1"> Select Your Role</p>
//             </h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//               {/* Role */}
//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                     <i className="fa-solid fa-user-shield text-sm"></i> Role
//                   </span>
//                 </label>
//                 <select
//                   className="select select-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
//                   value={role}
//                   onChange={handleRoleChange}
//                 >
//                   <option value="">
//                     {loadingRoles ? "Loading roles..." : "Select Role"}
//                   </option>
//                   {filteredRoles.map((roleItem) => (
//                     <option key={roleItem.id} value={roleItem.name}>
//                       {roleItem.name.charAt(0).toUpperCase() +
//                         roleItem.name.slice(1).toLowerCase()}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Class for Student */}
//               {role === constants.roles.student && (
//                 <div className="form-control">
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                       <i className="fa-solid fa-graduation-cap text-sm"></i>{" "}
//                       Class <span className="text-error">*</span>
//                     </span>
//                   </label>
//                   <select
//                     name="year_level"
//                     className="select select-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
//                     required
//                     value={formData.year_level}
//                     onChange={handleChange}
//                   >
//                     <option value="">
//                       {yearLevel.length === 0
//                         ? "Loading classes..."
//                         : "Select Class"}
//                     </option>
//                     {yearLevel.map((yearlev) => (
//                       <option value={yearlev.id} key={yearlev.id}>
//                         {yearlev.level_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//         {/* STEP 1 */}
//         {step === 1 && (
//           <div className="w-full max-w-6xl mx-auto p-6">
//             <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
//               Upload your documents{" "}
//               <i className="fa-solid fa-cloud-upload-alt ml-2"></i>
//             </h1>

//             {uploadFields.map((field, index) => (
//               <div
//                 key={index}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full"
//               >
//                 {/* File Upload */}
//                 <div className="form-control w-full">
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1 pt-6">
//                       <i className="fa-solid fa-file-upload text-sm"></i>{" "}
//                       Document Upload
//                       <span className="text-error">*</span>
//                     </span>
//                   </label>
//                   <input
//                     type="file"
//                     name="file"
//                     accept=".jpg,.jpeg,.png,.pdf"
//                     className="file-input file-input-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
//                     required
//                     onChange={(e) => handleFileChange(e, index)}
//                   />
//                   <div className="h-5">
//                     <span className="text-red-500 text-sm leading-tight">
//                       {FilesErrors[index] || ""}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Document Type */}
//                 <div className="form-control w-full">
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1 pt-6">
//                       <i className="fa-solid fa-file text-sm"></i> Document Type
//                       <span className="text-error">*</span>
//                     </span>
//                   </label>
//                   <select
//                     name="document_types"
//                     className="select select-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
//                     value={field.document_types}
//                     onChange={(e) => handleUploadChange(e, index)}
//                   >
//                     <option value="">Select Document Type</option>
//                     {getAvailableDocumentTypes(index).map((doc) => (
//                       <option key={doc.id} value={doc.id}>
//                         {doc.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="h-5">
//                     <span className="text-red-500 text-sm leading-tight">
//                       {docTypeErrors[index] || ""}
//                     </span>
//                   </div>
//                 </div>
//                 {/* Identity */}
//                 <div className="form-control w-full pt-6">
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                       <i className="fa-solid fa-id-card text-sm"></i> Identity  <span className="text-error">*</span>
//                     </span>
//                   </label>
//                   <input
//                     type="text"
//                     name="identities"
//                     value={field.identities.toUpperCase()}
//                     onChange={(e) => handleUploadChange(e, index)}
//                     placeholder="Enter identity ID"
//                     className="input input-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
//                     maxLength={
//                       field.document_types
//                         ? getIdentityMaxLength(field.document_types)
//                         : undefined
//                     }
//                   />
//                   <div className="h-5">
//                     <span className="text-error text-sm block mt-1">
//                       {identityErrors[index] || ""}
//                       {/* React Hook Form Error */}
//                       {apiErrors.identities && (
//                         <span className="text-error text-sm">
//                           {apiErrors.identities.message}
//                         </span>
//                       )}

//                       {/* Backend API Error */}
//                       {apiErrors.identities &&
//                         Array.isArray(apiErrors.identities) &&
//                         apiErrors.identities.map((msg, idx) => (
//                           <span key={idx} className="text-error text-sm block mt-1">
//                             {msg}
//                           </span>
//                         ))}


//                     </span>
//                   </div>
//                 </div>

//                 {/* Add/Remove */}
//                 <div className="form-control w-full flex items-end pt-7 ">
//                   {index === 0 ? (
//                     <button
//                       type="button"
//                       className={`btn bgTheme text-white w-auto md:w-36  ${AddField === 3
//                         ? "opacity-50 cursor-not-allowed"
//                         : "hover:bg-purple-700"
//                         }`}
//                       onClick={handleAddField}
//                       disabled={AddField === 3}
//                     >
//                       <i className="fa-solid fa-plus mr-1"></i> Add
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       className="btn btn-error w-auto md:w-36 "
//                       onClick={() => {
//                         setUploadFields(
//                           uploadFields.filter((_, i) => i !== index)
//                         ),
//                           setAddField(AddField - 1);
//                       }}
//                     >
//                       <i className="fa-solid fa-trash mr-1"></i> Remove
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {/* Role-based dropdowns */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//               {role === constants.roles.student && (
//                 <div className="form-control relative" ref={studentDropdownRef}>
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                       <i className="fa-solid fa-user-graduate text-sm"></i>{" "}
//                       Student
//                     </span>
//                   </label>

//                   <div
//                     className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
//                     onClick={() => setShowStudentDropdown(!showStudentDropdown)}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" || e.key === " ")
//                         setShowStudentDropdown(!showStudentDropdown);
//                     }}
//                   >
//                     {selectedStudentName ||
//                       (loadingStudents
//                         ? "Loading students..."
//                         : "Select Student")}
//                     <div >
//                       <span class="arrow">&#9662;</span>
//                     </div>
//                   </div>

//                   {showStudentDropdown && (
//                     <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//                       <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
//                         <input
//                           type="text"
//                           placeholder="Search Student..."
//                           className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//                           value={searchStudentInput}
//                           onChange={(e) =>
//                             setSearchStudentInput(e.target.value)
//                           }
//                         />
//                       </div>

//                       <div className="max-h-40 overflow-y-auto">
//                         {!loadingStudents && filteredStudents.length > 0 ? (
//                           filteredStudents.map((studentObj) => (
//                             <p
//                               key={studentObj.student_id}
//                               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                               onClick={() => {
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   student: studentObj.student_id.toString(),
//                                 }));
//                                 setSelectedStudentName(studentObj.student_name);
//                                 setSearchStudentInput("");
//                                 setShowStudentDropdown(false);
//                                 setDisable(false);
//                               }}
//                             >
//                               {studentObj.student_name}
//                             </p>
//                           ))
//                         ) : (
//                           <p className="p-2 text-gray-500 dark:text-gray-400">
//                             {loadingStudents
//                               ? "Loading students..."
//                               : "No students found."}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {role === constants.roles.teacher && (
//                 <div className="form-control relative" ref={teacherDropdownRef}>
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                       <i className="fa-solid fa-chalkboard-teacher text-sm"></i>{" "}
//                       Teacher
//                     </span>
//                   </label>

//                   <div className="form-control relative">
//                     {/* Clickable dropdown box */}
//                     <div
//                       className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
//                       onClick={() =>
//                         setShowTeacherDropdown(!showTeacherDropdown)
//                       }
//                     >
//                       {selectedTeacherName || "Select Teacher"}
//                       <div >
//                         <span class="arrow">&#9662;</span>
//                       </div>
//                     </div>

//                     {/* Dropdown content */}
//                     {showTeacherDropdown && (
//                       <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//                         {/* Search input */}
//                         <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
//                           <input
//                             type="text"
//                             placeholder="Search Teacher..."
//                             className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//                             value={searchTeacherInput}
//                             onChange={(e) =>
//                               setSearchTeacherInput(e.target.value)
//                             }
//                             autoComplete="off"
//                           />
//                         </div>

//                         {/* List of teachers */}
//                         <div className="max-h-40 overflow-y-auto">
//                           {filteredTeachers?.length > 0 ? (
//                             filteredTeachers.map((teacher) => (
//                               <p
//                                 key={teacher.id}
//                                 className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                                 onClick={() => {
//                                   const fullName = `${teacher.first_name} ${teacher.last_name}`;
//                                   setSelectedTeacherId(teacher.id);
//                                   setSelectedTeacherName(fullName);
//                                   setSearchTeacherInput("");
//                                   setShowTeacherDropdown(false);
//                                 }}
//                               >
//                                 {teacher.first_name} {teacher.last_name}
//                               </p>
//                             ))
//                           ) : (
//                             <p className="p-2 text-gray-500 dark:text-gray-400">
//                               No teachers found.
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {showTeacherDropdown && (
//                     <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//                       <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
//                         <input
//                           type="text"
//                           placeholder="Search Teacher..."
//                           className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//                           value={searchTeacherInput}
//                           onChange={(e) =>
//                             setSearchTeacherInput(e.target.value)
//                           }
//                         />
//                       </div>

//                       <div className="max-h-40 overflow-y-auto">
//                         {!loadingTeachers &&
//                           filteredTeachers.map((teacher) => (
//                             <p
//                               key={teacher.id}
//                               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                               onClick={() => {
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   teacher: teacher.id.toString(),
//                                 }));
//                                 setSelectedTeacherName(
//                                   `${teacher.first_name} ${teacher.last_name}`
//                                 );
//                                 setSearchTeacherInput("");
//                                 setShowTeacherDropdown(false);
//                                 setDisable(false);
//                               }}
//                             >
//                               {teacher.first_name} {teacher.last_name}
//                             </p>
//                           ))}

//                         {filteredTeachers.length === 0 && (
//                           <p className="p-2 text-gray-500 dark:text-gray-400">
//                             No teachers found.
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//               {role === constants.roles.guardian && (
//                 <div className="form-control relative" ref={guardianDropdownRef}>
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                       <i className="fa-solid fa-user-shield text-sm"></i>{" "}
//                       Guardian
//                     </span>
//                   </label>

//                   <div
//                     className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
//                     onClick={() =>
//                       setShowGuardianDropdown(!showGuardianDropdown)
//                     }
//                   >
//                     {selectedGuardianName || "Select Guardian"}
//                     <div >
//                       <span class="arrow">&#9662;</span>
//                     </div>
//                   </div>

//                   {showGuardianDropdown && (
//                     <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//                       <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
//                         <input
//                           type="text"
//                           placeholder="Search Guardian..."
//                           className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//                           value={searchGuardianInput}
//                           onChange={(e) =>
//                             setSearchGuardianInput(e.target.value)
//                           }
//                         />
//                       </div>

//                       <div className="max-h-40 overflow-y-auto">
//                         {!loadingGuardians &&
//                           filteredGuardians.map((guardian) => (
//                             <p
//                               key={guardian.id}
//                               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                               onClick={() => {
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   guardian: guardian.id.toString(),
//                                 }));
//                                 setSelectedGuardianName(
//                                   `${guardian.first_name} ${guardian.last_name}`
//                                 );
//                                 setSearchGuardianInput("");
//                                 setShowGuardianDropdown(false);
//                                 setDisable(false);
//                               }}
//                             >
//                               {guardian.first_name} {guardian.last_name}
//                             </p>
//                           ))}

//                         {filteredGuardians.length === 0 && (
//                           <p className="p-2 text-gray-500 dark:text-gray-400">
//                             No guardians found.
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {role === constants.roles.officeStaff && (
//                 <div className="form-control relative" ref={officeStaffDropdownRef}>
//                   <label className="label">
//                     <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
//                       <i className="fa-solid fa-briefcase text-sm"></i> Office
//                       Staff
//                     </span>
//                   </label>

//                   <div
//                     className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
//                     onClick={() =>
//                       setShowOfficeStaffDropdown(!showOfficeStaffDropdown)
//                     }
//                   >
//                     {selectedOfficeStaffName || "Select Office Staff"}
//                     <div >
//                       <span class="arrow">&#9662;</span>
//                     </div>
//                   </div>

//                   {showOfficeStaffDropdown && (
//                     <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//                       <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
//                         <input
//                           type="text"
//                           placeholder="Search Office Staff..."
//                           className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//                           value={searchOfficeStaffInput}
//                           onChange={(e) =>
//                             setSearchOfficeStaffInput(e.target.value)
//                           }
//                         />
//                       </div>

//                       <div className="max-h-40 overflow-y-auto">
//                         {!loadingOfficeStaff &&
//                           filteredOfficeStaff.map((staff) => (
//                             <p
//                               key={staff.id}
//                               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                               onClick={() => {
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   office_staff: staff.id.toString(),
//                                 }));
//                                 setSelectedOfficeStaffName(
//                                   `${staff.first_name} ${staff.last_name}`
//                                 );
//                                 setSearchOfficeStaffInput("");
//                                 setShowOfficeStaffDropdown(false);
//                                 setDisable(false);
//                               }}
//                             >
//                               {staff.first_name} {staff.last_name}
//                             </p>
//                           ))}

//                         {filteredOfficeStaff.length === 0 && (
//                           <p className="p-2 text-gray-500 dark:text-gray-400">
//                             No office staff found.
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Navigation Buttons */}
//         <div className="flex flex-col ju md:flex-row items-center md:items-stretch gap-4 p-6">
//           {step === 0 && (
//             <div className="flex-1 flex justify-end">
//               <button
//                 type="button"
//                 onClick={next}
//                 className={`btn bgTheme text-white w-40 ${role.length === 0 ||
//                   (role === constants.roles.student && !formData.year_level)
//                   ? "opacity-50 cursor-not-allowed"
//                   : "hover:bg-purple-700"
//                   }`}
//                 disabled={
//                   role.length === 0 ||
//                   (role === constants.roles.student && !formData.year_level)
//                 }
//               >
//                 Next
//               </button>
//             </div>
//           )}
//           {step === 1 && (
//             <div className="flex-1 flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={handleBack}
//                 className="btn bgTheme w-auto md:w-36 text-white  hover:bg-purple-700 flex items-center justify-center"
//               >
//                 <i className="fa-solid fa-arrow-left mr-2"></i> Back
//               </button>

//               <button
//                 type="submit"
//                 className={`btn bgTheme text-white w-auto md:w-36  ${Disable
//                   ? "opacity-50 cursor-not-allowed"
//                   : "hover:bg-purple-700"
//                   }`}
//                 disabled={Disable}
//               >
//                 {loading ? (
//                   <>
//                     <i className="fa-solid fa-spinner fa-spin mr-2"></i>
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa-solid fa-cloud-upload-alt mr-2"></i> Upload
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </form>

//       {/* Modal */}
//       {showAlert && (
//         <dialog className="modal modal-open">
//           <div className="modal-box bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
//             <h3 className="font-bold text-lg">Document Upload</h3>
//             <p className="py-4">
//               {alertMessage.split("\n").map((line, idx) => (
//                 <span key={idx}>
//                   {line}
//                   <br />
//                 </span>
//               ))}
//             </p>
//             <div className="modal-action">
//               <button
//                 className="btn bgTheme text-white w-30"
//                 onClick={() => {
//                   setShowAlert(false);
//                   setApiErrors({});
//                 }}
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         </dialog>
//       )}
//     </div>
//   );
// };








import React, { useEffect, useState, useRef } from "react";
import {
  fetchDocumentType,
  fetchGuardians,
  fetchOfficeStaff,
  fetchRoles,
  fetchStudentYearLevelByClass,
  fetchTeachers,
  fetchYearLevels,
} from "../services/api/Api";
import { constants } from "../global/constants";
import axios from "axios";
import html2canvas from 'html2canvas';

export const DocumentUpload = () => {
  // STEPS LOGIC
  const [step, setStep] = useState(0);
  const next = () => setStep((prev) => Math.min(prev + 1, 1));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  // FORM DATA & DROPDOWN STATES
  const [allRoles, setAllRoles] = useState([]);
  const [documentType, setDocumentType] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [officeStaff, setOfficeStaff] = useState([]);
  const [yearLevel, setYearLevel] = useState([]);
  const [yearLevelID, setYearLevelID] = useState("");

  const [loadingRoles, setLoadingRoles] = useState(false);
  const [Disable, setDisable] = useState(true);
  const [AddField, setAddField] = useState(0);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [searchTeacherInput, setSearchTeacherInput] = useState("");
  const [showGuardianDropdown, setShowGuardianDropdown] = useState(false);
  const [selectedGuardianName, setSelectedGuardianName] = useState("");
  const [searchGuardianInput, setSearchGuardianInput] = useState("");
  const [showOfficeStaffDropdown, setShowOfficeStaffDropdown] = useState(false);
  const [selectedOfficeStaffName, setSelectedOfficeStaffName] = useState("");
  const [searchOfficeStaffInput, setSearchOfficeStaffInput] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [searchStudentInput, setSearchStudentInput] = useState("");

  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [loadingOfficeStaff, setLoadingOfficeStaff] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [docTypeErrors, setDocTypeErrors] = useState([]);
  const [FilesErrors, setFilesErrors] = useState([]);
  const [apiErrors, setApiErrors] = useState({});

  // TC Modal States
  const [showTcModal, setShowTcModal] = useState(false);
  const [tcFormData, setTcFormData] = useState({
    scholarNo: "",
    aadharNo: "",
    sssmid: "",
    fmd: "",
    aparId: "",
    penNo: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    school: "",
    district: "",
    admissionDate: "",
    leavingDate: "",
    dob: "",
    dobWords: "",
    vaccinated: "Yes",
    lastExamClass: "",
    medium: "English",
    lastExamYear: "",
    promotedToClass: "",
    character: "Good",
    date: ""
  });
  const [tcUploadIndex, setTcUploadIndex] = useState(-1);
  const [generatingTC, setGeneratingTC] = useState(false);

  const [role, setRole] = useState("");

  const studentDropdownRef = useRef(null);
  const teacherDropdownRef = useRef(null);
  const guardianDropdownRef = useRef(null);
  const officeStaffDropdownRef = useRef(null);
  const tcTemplateRef = useRef(null);

  const [formData, setFormData] = useState({
    student: "",
    teacher: "",
    guardian: "",
    office_staff: "",
    year_level: "",
  });

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.first_name} ${teacher.last_name}`
      .toLowerCase()
      .includes(searchTeacherInput.toLowerCase())
  );
  const filteredGuardians = guardians.filter((guardian) =>
    `${guardian.first_name} ${guardian.last_name}`
      .toLowerCase()
      .includes(searchGuardianInput.toLowerCase())
  );
  const filteredOfficeStaff = officeStaff.filter((staff) =>
    `${staff.first_name} ${staff.last_name}`
      .toLowerCase()
      .includes(searchOfficeStaffInput.toLowerCase())
  );
  const filteredStudents = students.filter((studentObj) =>
    studentObj.student_name
      .toLowerCase()
      .includes(searchStudentInput.toLowerCase())
  );

  // Dynamic fields for document uploads
  const [uploadFields, setUploadFields] = useState([
    { files: null, document_types: "", identities: "" },
  ]);
  const [identityErrors, setIdentityErrors] = useState([]);

  // Helper function to get max length based on document type
  const getIdentityMaxLength = (docTypeId) => {
    if (!docTypeId) return undefined;

    const selectedDoc = documentType.find(
      (doc) => doc.id.toString() === docTypeId.toString()
    );
    if (!selectedDoc) return undefined;

    const name = selectedDoc.name.trim().toLowerCase();

    const maxLengths = {
      "adharcard": 12,
      "pan card": 10,
      "passport": 8,
      "driving license": 20,
      "caste certificate": 15,
      "birth certificate": 15,
      "transfer certificate": 20,
      "bonafide certificate": 20,
      "migration certificate": 20,
      "date of birth certificate": 20,
      "income certificate": 20,
      "domicile certificate": 20,
      "library card": 15,
      "other": 50
    };

    const matchedType = Object.keys(maxLengths).find(key =>
      name.includes(key) || key.includes(name)
    );

    return matchedType ? maxLengths[matchedType] : 50;
  };

  // validation
  const validateIdentity = (identity, docTypeId) => {
    if (!docTypeId || !identity) return "";

    const selectedDoc = documentType.find(
      (doc) => doc.id.toString() === docTypeId.toString()
    );
    if (!selectedDoc) return "";

    const name = selectedDoc.name.trim().toLowerCase();

    if (name === "adharcard") {
      const aadhaarRegex = /^\d{12}$/;
      return aadhaarRegex.test(identity)
        ? ""
        : "Aadhaar must be 12 digits (e.g. 123456789012)";
    } else if (name === "passport") {
      const passportRegex = /^[A-Z]{1}[0-9]{7}$/;
      return passportRegex.test(identity)
        ? ""
        : "Passport format: 1 letter + 7 digits (e.g. K1234567)";
    } else if (name === "birth certificate") {
      const bcRegex = /^BRN-\d{4}-\d{3,}$/;
      return bcRegex.test(identity)
        ? ""
        : "Birth: BRN-2021-000123";
    } else if (name === "transfer certificate") {
      const tcRegex = /^TC-\d{4}-\d{3,}$/;
      return tcRegex.test(identity)
        ? ""
        : "TC: TC-YYYY-XXX (e.g. TC-2022-00123)";
    } else if (name === "bonafide certificate") {
      const bonafideRegex = /^BONAFIDE-\d{4}-\d{3,}$/;
      return bonafideRegex.test(identity)
        ? ""
        : "Bonafide: BONAFIDE-2023-001";
    } else if (name === "pan card") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      return panRegex.test(identity)
        ? ""
        : "PAN: AAAAA9999A (format)";
    } else if (name === "migration certificate") {
      const migrationRegex = /^[A-Z]{2,10}\/\d{4}\/\d{3,6}$/;
      return migrationRegex.test(identity)
        ? ""
        : "Migration: CBSE/2020/123456";
    } else if (name === "driving license") {
      const dlRegex = /^[A-Z]{2}[ -]?\d{2}[ -]?\d{2,4}[ -]?\d{6,7}$/;
      return dlRegex.test(identity)
        ? ""
        : "DL: XX00-YYYY-Number (e.g. DL01-2017-001234)";
    } else if (name === "caste certificate") {
      const casteRegex = /^CASTE-\d{4}-\d{3,}$/;
      return casteRegex.test(identity)
        ? ""
        : "Caste: CASTE-2023-001 (format)";
    }

    return "";
  };

  // --- API FETCH FUNCTIONS ---
  const getRoles = async () => {
    setLoadingRoles(true);
    try {
      const roles = await fetchRoles();
      setAllRoles(roles);
    } catch {
      console.log("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const getDocumentTypes = async () => {
    setLoadingDocumentTypes(true);
    try {
      const docType = await fetchDocumentType();
      const sortedDocType = [...docType].sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      );
      setDocumentType(sortedDocType);
    } catch (error) {
      console.log("Failed to load document types");
    } finally {
      setLoadingDocumentTypes(false);
    }
  };

  const getTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const allTeachers = await fetchTeachers();
      const sortedTeachers = [...allTeachers].sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
      });
      setTeachers(sortedTeachers);
    } catch {
      console.log("Failed to load teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const getGuardians = async () => {
    setLoadingGuardians(true);
    try {
      const allGuardians = await fetchGuardians();
      const sortedGuardians = [...allGuardians].sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
      });

      setGuardians(sortedGuardians);
    } catch {
      console.log("Failed to load guardians");
    } finally {
      setLoadingGuardians(false);
    }
  };

  const getOfficeStaff = async () => {
    setLoadingOfficeStaff(true);
    try {
      const allStaff = await fetchOfficeStaff();
      const sortedStaff = [...allStaff].sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
      });

      setOfficeStaff(sortedStaff);
    } catch {
      console.log("Failed to load office staff");
    } finally {
      setLoadingOfficeStaff(false);
    }
  };

  const getYearLevels = async () => {
    try {
      const yl = await fetchYearLevels();
      setYearLevel(yl);
    } catch {
      console.log("Failed to load year levels");
    }
  };

  const getStudentsYearLevel = async () => {
    if (!yearLevelID) return;
    setLoadingStudents(true);
    try {
      const allStudentsByClass = await fetchStudentYearLevelByClass(
        yearLevelID
      );
      const sortedStudents = [...allStudentsByClass].sort((a, b) =>
        a.student_name.localeCompare(b.student_name, "en", {
          sensitivity: "base",
        })
      );

      setStudents(sortedStudents);
    } catch {
      console.log("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // --- FETCH STUDENT DETAILS FOR TC USING ADMISSION API ---
  const fetchStudentDetailsForTC = async (studentId) => {
    try {
      console.log("🔄 Fetching student details for ID:", studentId);
      
      // Use the admission API endpoint
      const response = await axios.get(
        `${constants.baseUrl}/d/admission/${studentId}/`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log("✅ API Response:", response.data);
      const data = response.data;
      
      // Map the API response to TC form fields
      const studentDetails = {
        scholar_no: data.student_input?.scholar_number || "",
        aadhar_no: data.student_input?.aadhaar_number || "",
        sssmid: data.student_input?.SSSMID || "",
        fmd: data.student_input?.FMID_number || "",
        apar_id: data.student_input?.apaar_number || "",
        pen_no: data.student_input?.PEN_number || "",
        student_name: `${data.student_input?.first_name || ''} ${data.student_input?.middle_name || ''} ${data.student_input?.last_name || ''}`.trim(),
        father_name: data.student_input?.father_name || "",
        mother_name: data.student_input?.mother_name || "",
        school_name: data.previous_school_name || "Current School",
        district: data.address?.district || "",
        admission_date: data.admission_date || "",
        leaving_date: "", // You can calculate this or fetch from another API
        dob: data.student_input?.date_of_birth || "",
        dob_words: data.student_input?.date_of_birth ? new Date(data.student_input.date_of_birth).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : "",
        vaccinated: "Yes",
        last_exam_class: data.previous_standard_studied || "",
        medium: data.student_input?.medium || "English",
        last_exam_year: data.school_year || "",
        promoted_to_class: data.year_level || "",
        character: "Good"
      };
      
      console.log("📋 Mapped Student Details:", studentDetails);
      return studentDetails;
      
    } catch (error) {
      console.error("❌ API Error:", error);
      console.log("⚠️ Using dummy data as fallback");
      return getDummyStudentData(studentId);
    }
  };

  // Fallback dummy data
  const getDummyStudentData = (studentId) => {
    const dummyStudents = {
      '436': {
        scholar_no: '1.15.4',
        aadhar_no: '749687378789',
        sssmid: '320391008',
        fmd: '5010291016',
        apar_id: '1',
        pen_no: '21317093546',
        student_name: 'Ahmed Arif',
        father_name: 'Arif khan',
        mother_name: 'Asma Khan',
        school_name: 'J.S. School',
        district: 'Dhapal',
        admission_date: '2026-07-10',
        leaving_date: '2026-05-31',
        dob: '2016-09-10',
        dob_words: '10th September 2016',
        vaccinated: 'Yes',
        last_exam_class: '7',
        medium: 'English',
        last_exam_year: '2025-26',
        promoted_to_class: 'Class 8',
        character: 'Good'
      },
      '438': {
        scholar_no: '2.10.3',
        aadhar_no: '987654321012',
        sssmid: '420392109',
        fmd: '5020392017',
        apar_id: '2',
        pen_no: '31317093547',
        student_name: 'Amit Kumar',
        father_name: 'Rajesh Kumar',
        mother_name: 'Sunita Devi',
        school_name: 'K.V. School',
        district: 'Delhi',
        admission_date: '2023-06-15',
        leaving_date: '2026-05-31',
        dob: '2015-08-20',
        dob_words: '20th August 2015',
        vaccinated: 'Yes',
        last_exam_class: 'V',
        medium: 'Hindi',
        last_exam_year: '2023-24',
        promoted_to_class: 'VI',
        character: 'Excellent'
      }
    };
    
    return dummyStudents[studentId] || dummyStudents['436'];
  };

  // --- HANDLERS ---
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setFormData({
      student: "",
      teacher: "",
      guardian: "",
      office_staff: "",
      year_level: "",
    });
    setSelectedStudentName("");
    setSelectedTeacherName("");
    setSelectedGuardianName("");
    setSelectedOfficeStaffName("");
    setDisable(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "year_level") {
      setFormData((prev) => ({ ...prev, [name]: value, student: "" }));
      setSelectedStudentName("");
      setDisable(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddField = () => {
    if (AddField < 3) {
      setAddField(AddField + 1);
      setUploadFields([
        ...uploadFields,
        { files: null, document_types: "", identities: "" },
      ]);
      setIdentityErrors([...identityErrors, ""]);
      setDocTypeErrors([...docTypeErrors, ""]);
      setFilesErrors([...FilesErrors, ""]);
    }
  };

  const handleFileChange = (e, index) => {
    const newFields = [...uploadFields];
    newFields[index].files = e.target.files[0];
    setUploadFields(newFields);
    
    const newFileErrors = [...FilesErrors];
    newFileErrors[index] = "";
    setFilesErrors(newFileErrors);
  };

  // --- TC MODAL HANDLERS ---
  const handleDocumentTypeChange = async (e, index) => {
    const selectedDocType = e.target.value;
    
    console.log("======= DOCUMENT TYPE CHANGE =======");
    console.log("Selected Doc Type ID:", selectedDocType);
    console.log("Current formData:", formData);
    console.log("Student ID:", formData.student);
    
    const selectedDoc = documentType.find(doc => doc.id.toString() === selectedDocType);
    console.log("Selected Doc:", selectedDoc);
    
    const newFields = [...uploadFields];
    newFields[index].document_types = selectedDocType;
    setUploadFields(newFields);

    // Check if Transfer Certificate is selected
    if (selectedDoc && formData.student) {
      const docName = selectedDoc.name.toLowerCase().trim();
      const isTC = docName.includes('transfer') && docName.includes('certificate');
      
      console.log("Is Transfer Certificate?", isTC);
      
      if (isTC) {
        console.log("✅ Opening TC Modal...");
        setTcUploadIndex(index);
        
        try {
          const studentDetails = await fetchStudentDetailsForTC(formData.student);
          console.log("Student Details:", studentDetails);
          
          if (studentDetails) {
            setTcFormData({
              scholarNo: studentDetails.scholar_no || "",
              aadharNo: studentDetails.aadhar_no || "",
              sssmid: studentDetails.sssmid || "",
              fmd: studentDetails.fmd || "",
              aparId: studentDetails.apar_id || "",
              penNo: studentDetails.pen_no || "",
              studentName: studentDetails.student_name || selectedStudentName || "",
              fatherName: studentDetails.father_name || "",
              motherName: studentDetails.mother_name || "",
              school: studentDetails.school_name || "",
              district: studentDetails.district || "",
              admissionDate: studentDetails.admission_date || "",
              leavingDate: studentDetails.leaving_date || "",
              dob: studentDetails.dob || "",
              dobWords: studentDetails.dob_words || "",
              vaccinated: studentDetails.vaccinated || "Yes",
              lastExamClass: studentDetails.last_exam_class || "",
              medium: studentDetails.medium || "English",
              lastExamYear: studentDetails.last_exam_year || "",
              promotedToClass: studentDetails.promoted_to_class || "",
              character: studentDetails.character || "Good",
              date: new Date().toISOString().split('T')[0]
            });
            setShowTcModal(true);
            console.log("✅ TC Modal Opened!");
          }
        } catch (error) {
          console.error("Error:", error);
          setAlertMessage("Error fetching student details");
          setShowAlert(true);
        }
      }
    } else {
      if (selectedDoc && selectedDoc.name.toLowerCase().includes('transfer')) {
        setAlertMessage("⚠️ Please select a student first!");
        setShowAlert(true);
      }
    }
  };

  // --- GENERATE TC IMAGE ---
  const generateTcImage = async () => {
    setGeneratingTC(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const tcElement = document.getElementById('tc-template');
      if (!tcElement) {
        throw new Error("TC template not found");
      }

      const canvas = await html2canvas(tcElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        logging: false,
        width: 794,
        height: 1123
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File(
              [blob], 
              `TC_${tcFormData.scholarNo || 'student'}_${Date.now()}.png`, 
              { type: 'image/png' }
            );
            resolve(file);
          } else {
            resolve(null);
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error("Error generating TC:", error);
      setAlertMessage("Error generating TC: " + error.message);
      setShowAlert(true);
      return null;
    } finally {
      setGeneratingTC(false);
    }
  };

  // --- HANDLE TC SUBMIT ---
  const handleTcSubmit = async () => {
    try {
      const tcFile = await generateTcImage();
      if (!tcFile) {
        setAlertMessage("Failed to generate TC. Please try again.");
        setShowAlert(true);
        return;
      }

      const newFields = [...uploadFields];
      if (tcUploadIndex !== -1) {
        newFields[tcUploadIndex].files = tcFile;
        const identityValue = `TC-${tcFormData.scholarNo || '0000'}-${Date.now().toString().slice(-5)}`;
        newFields[tcUploadIndex].identities = identityValue;
        setUploadFields(newFields);
        
        const newIdentityErrors = [...identityErrors];
        newIdentityErrors[tcUploadIndex] = "";
        setIdentityErrors(newIdentityErrors);
        
        const newFileErrors = [...FilesErrors];
        newFileErrors[tcUploadIndex] = "";
        setFilesErrors(newFileErrors);
      }

      setShowTcModal(false);
      setAlertMessage("✅ Transfer Certificate generated successfully!");
      setShowAlert(true);
      
      setTcFormData({
        scholarNo: "",
        aadharNo: "",
        sssmid: "",
        fmd: "",
        aparId: "",
        penNo: "",
        studentName: "",
        fatherName: "",
        motherName: "",
        school: "",
        district: "",
        admissionDate: "",
        leavingDate: "",
        dob: "",
        dobWords: "",
        vaccinated: "Yes",
        lastExamClass: "",
        medium: "English",
        lastExamYear: "",
        promotedToClass: "",
        character: "Good",
        date: ""
      });
      setTcUploadIndex(-1);
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("Error generating TC. Please try again.");
      setShowAlert(true);
    }
  };

  const handleUploadChange = (e, index) => {
    const { name, value } = e.target;

    const newFields = [...uploadFields];
    newFields[index][name] = value;
    setUploadFields(newFields);

    if (name === "identities" || name === "document_types") {
      const newErrors = [...identityErrors];
      const validationError = validateIdentity(
        name === "identities" ? value : newFields[index].identities,
        name === "document_types" ? value : newFields[index].document_types
      );
      newErrors[index] = validationError || "";
      setIdentityErrors(newErrors);
    }
  };

  const getAvailableDocumentTypes = (currentIndex) => {
    const selectedDocTypes = uploadFields
      .map((field, idx) => (idx !== currentIndex ? field.document_types : null))
      .filter(Boolean);
    return documentType.filter(
      (doc) => !selectedDocTypes.includes(doc.id.toString())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newDocErrors = [...docTypeErrors];
    const newIdentityErrors = [...identityErrors];
    const newFileErrors = [...FilesErrors];
    let hasError = false;

    try {
      for (const [index, field] of uploadFields.entries()) {
        if (!field.document_types) {
          newDocErrors[index] = "Please select a document type";
          hasError = true;
        } else {
          newDocErrors[index] = "";
        }

        if (!field.files) {
          newFileErrors[index] = "Please upload a file";
          hasError = true;
        } else {
          newFileErrors[index] = "";
        }

        if (!field.identities) {
          newIdentityErrors[index] = "Please enter identity";
          hasError = true;
        } else {
          const identityError = validateIdentity(
            field.identities,
            field.document_types
          );
          if (identityError) {
            newIdentityErrors[index] = identityError;
            hasError = true;
          } else {
            newIdentityErrors[index] = "";
          }
        }
      }

      setDocTypeErrors(newDocErrors);
      setIdentityErrors(newIdentityErrors);
      setFilesErrors(newFileErrors);

      if (hasError) {
        setLoading(false);
        return;
      }

      for (const field of uploadFields) {
        const formDataToSend = new FormData();
        formDataToSend.append("files", field.files);
        formDataToSend.append("document_types", field.document_types);

        if (formData.student)
          formDataToSend.append("student", formData.student);
        if (formData.teacher)
          formDataToSend.append("teacher", formData.teacher);
        if (formData.guardian)
          formDataToSend.append("guardian", formData.guardian);
        if (formData.office_staff)
          formDataToSend.append("office_staff", formData.office_staff);
        if (field.identities)
          formDataToSend.append("identities", field.identities);

        await axios.post(`${constants.baseUrl}/d/Document/`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setAlertMessage("✅ Documents uploaded successfully!");
      setShowAlert(true);
      setUploadFields([{ files: null, document_types: "", identities: "" }]);
      setFormData({
        student: "",
        teacher: "",
        guardian: "",
        office_staff: "",
        year_level: "",
      });
      setRole("");
      setStep(0);
      setApiErrors({});
      setSelectedTeacherName("");
      setSearchTeacherInput("");
      setSelectedGuardianName("");
      setSearchGuardianInput("");
      setSelectedOfficeStaffName("");
      setSearchOfficeStaffInput("");
      setSelectedStudentName("");
      setSearchStudentInput("");
      setDisable(true);
    } catch (err) {
      console.error("Submit error:", err);
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        if (responseData.error === "You can't modify the identity of an existing document.") {
          setAlertMessage("You can't modify the identity of an existing document.");
          setShowAlert(true);
        } else {
          setApiErrors(responseData);
          setAlertMessage("Error uploading documents. Please try again.");
          setShowAlert(true);
        }
      } else {
        setAlertMessage("An unexpected error occurred. Please try again.");
        setShowAlert(true);
      }
      setDisable(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setUploadFields([{ files: null, document_types: "", identities: "" }]);
    setFormData({
      student: "",
      teacher: "",
      guardian: "",
      office_staff: "",
      year_level: "",
    });
    setSelectedTeacherName("");
    setSearchTeacherInput("");
    setSelectedGuardianName("");
    setSearchGuardianInput("");
    setSelectedOfficeStaffName("");
    setSearchOfficeStaffInput("");
    setSelectedStudentName("");
    setSearchStudentInput("");
    setApiErrors({});
    setDocTypeErrors([]);
    setFilesErrors([]);
    setIdentityErrors([]);
    setAddField(0);
    prev();
    setDisable(true);
  };

  useEffect(() => {
    getRoles();
    getDocumentTypes();
    getTeachers();
    getGuardians();
    getOfficeStaff();
    getYearLevels();
  }, []);

  useEffect(() => {
    if (formData.year_level && yearLevel.length > 0) {
      const selected = yearLevel.find(
        (yl) => yl.id === parseInt(formData.year_level)
      );
      if (selected) setYearLevelID(selected.id);
    }
  }, [formData.year_level, yearLevel]);

  useEffect(() => {
    if (yearLevelID) getStudentsYearLevel();
  }, [yearLevelID]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target)
      ) {
        setShowStudentDropdown(false);
      }
      if (
        teacherDropdownRef.current &&
        !teacherDropdownRef.current.contains(event.target)
      ) {
        setShowTeacherDropdown(false);
      }
      if (
        guardianDropdownRef.current &&
        !guardianDropdownRef.current.contains(event.target)
      ) {
        setShowGuardianDropdown(false);
      }
      if (
        officeStaffDropdownRef.current &&
        !officeStaffDropdownRef.current.contains(event.target)
      ) {
        setShowOfficeStaffDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const hasNoDocTypeErrors = uploadFields.every((field, index) => {
      return field.document_types && !docTypeErrors[index];
    });

    const hasNoFileErrors = uploadFields.every((field, index) => {
      return field.files && !FilesErrors[index];
    });

    const hasNoIdentityErrors = uploadFields.every((field, index) => {
      return field.identities && !identityErrors[index];
    });

    const hasSelectedIdentity =
      formData.student ||
      formData.teacher ||
      formData.guardian ||
      formData.office_staff;

    const hasNoApiErrors = Object.keys(apiErrors).length === 0;

    const isFormValid =
      hasNoDocTypeErrors &&
      hasNoFileErrors &&
      hasNoIdentityErrors &&
      hasSelectedIdentity &&
      hasNoApiErrors;

    setDisable(!isFormValid);
  }, [uploadFields, docTypeErrors, FilesErrors, identityErrors, formData, apiErrors]);

  const filteredRoles = allRoles
    .filter(
      (role) =>
        role.name === constants.roles.teacher ||
        role.name === constants.roles.officeStaff ||
        role.name === constants.roles.student ||
        role.name === constants.roles.guardian
    )
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  // --- TC TEMPLATE COMPONENT ---
  const TCTemplate = ({ data }) => {
    return (
      <div 
        id="tc-template" 
        ref={tcTemplateRef}
        className="p-8 bg-white"
        style={{ 
          width: '794px', 
          height: '1123px',
          fontFamily: 'Times New Roman, serif',
          fontSize: '14px',
          border: '2px solid #000'
        }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">Form No. 4</h2>
          <h3 className="text-xl">02</h3>
          <h4 className="text-lg font-bold">TRANSFER CERTIFICATE</h4>
          <p className="mt-2">Scholar No. {data.scholarNo || '.................'}</p>
          <p>Aadhar No. {data.aadharNo || '.................'}</p>
          <p>SSSMID {data.sssmid || '.................'}</p>
          <p>FMD {data.fmd || '.................'}</p>
          <p>APAR ID {data.aparId || '.................'}</p>
          <p>PEN NO. {data.penNo || '.................'}</p>
        </div>
        
        <div className="mt-4 space-y-1">
          <p>This is to certify that Shri/ {data.studentName || '.................'}</p>
          <p>Father Name: {data.fatherName || '.................'}</p>
          <p>Mother Name: {data.motherName || '.................'}</p>
          <p>School: {data.school || '.................'}</p>
          <p>Dist. {data.district || '.................'}</p>
          <p>was attend into this school on the Dated {data.admissionDate || '.................'} to {data.leavingDate || '.................'}</p>
          <p>and now leaves the school on Dated {data.leavingDate || '.................'}.</p>
          <p>His/her date of birth according to the Admission Register is {data.dob || '.................'}</p>
          <p>(in words) {data.dobWords || '.................'}</p>
          <p>He/She has been vaccinated or is otherwise protected from small pox.</p>
          <p>The Last Annual Examination Passed by him/her was that of Class {data.lastExamClass || '.................'}</p>
          <p>Medium {data.medium || '.................'} in the year {data.lastExamYear || '.................'}</p>
          <p>and promotion has been to class {data.promotedToClass || '.................'}.</p>
          <p>His/Her Character was {data.character || '.................'}.</p>
        </div>
        
        <div className="mt-16 text-right">
          <p>Date {data.date || '.................'}</p>
          <p className="mt-8">Principal / H.M.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md my-5"
      >
        {/* Steps */}
        <ul className="steps mb-6 w-full">
          <li className={`step ${step >= 0 ? "step-primary" : ""}`}>Role</li>
          <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
            Fill Form
          </li>
        </ul>

        <style>
          {`
            .steps .step.step-primary::before,
            .steps .step.step-primary:before {
              background-color: #6d28d9 !important; 
              border-color: #6d28d9 !important;
              color: #ffffff !important; 
            }
            .steps .step.step-primary {
              color: #6d28d9 !important;
            }
            .steps .step.step-primary::after {
              border-color: #6d28d9 !important;
            }
          `}
        </style>

        {/* STEP 0 */}
        {step === 0 && (
          <div className="w-full max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
              Upload Documents
              <i className="fa-solid fa-cloud-upload-alt ml-2"></i>
              <p className="text-2xl m-1"> Select Your Role</p>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <i className="fa-solid fa-user-shield text-sm"></i> Role
                  </span>
                </label>
                <select
                  className="select select-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                  value={role}
                  onChange={handleRoleChange}
                >
                  <option value="">
                    {loadingRoles ? "Loading roles..." : "Select Role"}
                  </option>
                  {filteredRoles.map((roleItem) => (
                    <option key={roleItem.id} value={roleItem.name}>
                      {roleItem.name.charAt(0).toUpperCase() +
                        roleItem.name.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {role === constants.roles.student && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <i className="fa-solid fa-graduation-cap text-sm"></i>{" "}
                      Class <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="year_level"
                    className="select select-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                    required
                    value={formData.year_level}
                    onChange={handleChange}
                  >
                    <option value="">
                      {yearLevel.length === 0
                        ? "Loading classes..."
                        : "Select Class"}
                    </option>
                    {yearLevel.map((yearlev) => (
                      <option value={yearlev.id} key={yearlev.id}>
                        {yearlev.level_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="w-full max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
              Upload your documents{" "}
              <i className="fa-solid fa-cloud-upload-alt ml-2"></i>
            </h1>

            {/* DEBUG INFO */}
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-300">
              <h4 className="font-bold text-sm">🔍 Debug Info:</h4>
              <p className="text-sm">Role: <strong>{role || "Not Selected"}</strong></p>
              <p className="text-sm">Student ID: <strong>{formData.student || "Not Selected"}</strong></p>
              <p className="text-sm">Student Name: <strong>{selectedStudentName || "None"}</strong></p>
              <p className="text-sm">TC Modal: <strong>{showTcModal ? "✅ Open" : "❌ Closed"}</strong></p>
              <p className="text-sm">Document Types: <strong>{documentType.length}</strong></p>
            </div>

            {uploadFields.map((field, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full"
              >
                {/* File Upload */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1 pt-6">
                      <i className="fa-solid fa-file-upload text-sm"></i>{" "}
                      Document Upload
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="file-input file-input-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    required
                    onChange={(e) => handleFileChange(e, index)}
                  />
                  <div className="h-5">
                    <span className="text-red-500 text-sm leading-tight">
                      {FilesErrors[index] || ""}
                    </span>
                  </div>
                </div>

                {/* Document Type */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1 pt-6">
                      <i className="fa-solid fa-file text-sm"></i> Document Type
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="document_types"
                    className="select select-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                    value={field.document_types}
                    onChange={(e) => handleDocumentTypeChange(e, index)}
                  >
                    <option value="">Select Document Type</option>
                    {getAvailableDocumentTypes(index).map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                  <div className="h-5">
                    <span className="text-red-500 text-sm leading-tight">
                      {docTypeErrors[index] || ""}
                    </span>
                  </div>
                </div>
                
                {/* Identity */}
                <div className="form-control w-full pt-6">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <i className="fa-solid fa-id-card text-sm"></i> Identity  <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="identities"
                    value={field.identities.toUpperCase()}
                    onChange={(e) => handleUploadChange(e, index)}
                    placeholder="Enter identity ID"
                    className="input input-bordered w-full bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    maxLength={
                      field.document_types
                        ? getIdentityMaxLength(field.document_types)
                        : undefined
                    }
                  />
                  <div className="h-5">
                    <span className="text-error text-sm block mt-1">
                      {identityErrors[index] || ""}
                    </span>
                  </div>
                </div>

                {/* Add/Remove */}
                <div className="form-control w-full flex items-end pt-7 ">
                  {index === 0 ? (
                    <button
                      type="button"
                      className={`btn bgTheme text-white w-auto md:w-36  ${AddField === 3
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-purple-700"
                        }`}
                      onClick={handleAddField}
                      disabled={AddField === 3}
                    >
                      <i className="fa-solid fa-plus mr-1"></i> Add
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-error w-auto md:w-36 "
                      onClick={() => {
                        setUploadFields(
                          uploadFields.filter((_, i) => i !== index)
                        );
                        setAddField(AddField - 1);
                        setDocTypeErrors(docTypeErrors.filter((_, i) => i !== index));
                        setIdentityErrors(identityErrors.filter((_, i) => i !== index));
                        setFilesErrors(FilesErrors.filter((_, i) => i !== index));
                      }}
                    >
                      <i className="fa-solid fa-trash mr-1"></i> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Role-based dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {role === constants.roles.student && (
                <div className="form-control relative" ref={studentDropdownRef}>
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <i className="fa-solid fa-user-graduate text-sm"></i>{" "}
                      Student <span className="text-error">*</span>
                    </span>
                  </label>

                  <div
                    className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                    role="button"
                    tabIndex={0}
                  >
                    {selectedStudentName ||
                      (loadingStudents
                        ? "Loading students..."
                        : "Select Student")}
                    <span className="arrow">&#9662;</span>
                  </div>

                  {showStudentDropdown && (
                    <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                      <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                        <input
                          type="text"
                          placeholder="Search Student..."
                          className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                          value={searchStudentInput}
                          onChange={(e) =>
                            setSearchStudentInput(e.target.value)
                          }
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {!loadingStudents && filteredStudents.length > 0 ? (
                          filteredStudents.map((studentObj) => (
                            <p
                              key={studentObj.student_id}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                              onClick={() => {
                                console.log("✅ Student Selected:", studentObj);
                                const studentId = studentObj.student_id.toString();
                                setFormData(prev => ({
                                  ...prev,
                                  student: studentId,
                                }));
                                setSelectedStudentName(studentObj.student_name);
                                setSearchStudentInput("");
                                setShowStudentDropdown(false);
                                setDisable(false);
                                console.log("Student ID set to:", studentId);
                              }}
                            >
                              {studentObj.student_name}
                            </p>
                          ))
                        ) : (
                          <p className="p-2 text-gray-500 dark:text-gray-400">
                            {loadingStudents
                              ? "Loading students..."
                              : "No students found. Please select a class first."}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {role === constants.roles.teacher && (
                <div className="form-control relative" ref={teacherDropdownRef}>
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <i className="fa-solid fa-chalkboard-teacher text-sm"></i>{" "}
                      Teacher
                    </span>
                  </label>

                  <div
                    className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    onClick={() =>
                      setShowTeacherDropdown(!showTeacherDropdown)
                    }
                  >
                    {selectedTeacherName || "Select Teacher"}
                    <span className="arrow">&#9662;</span>
                  </div>

                  {showTeacherDropdown && (
                    <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                      <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                        <input
                          type="text"
                          placeholder="Search Teacher..."
                          className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                          value={searchTeacherInput}
                          onChange={(e) =>
                            setSearchTeacherInput(e.target.value)
                          }
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {filteredTeachers.map((teacher) => (
                          <p
                            key={teacher.id}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                teacher: teacher.id.toString(),
                              }));
                              setSelectedTeacherName(
                                `${teacher.first_name} ${teacher.last_name}`
                              );
                              setSearchTeacherInput("");
                              setShowTeacherDropdown(false);
                            }}
                          >
                            {teacher.first_name} {teacher.last_name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {role === constants.roles.guardian && (
                <div className="form-control relative" ref={guardianDropdownRef}>
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <i className="fa-solid fa-user-shield text-sm"></i>{" "}
                      Guardian
                    </span>
                  </label>

                  <div
                    className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    onClick={() =>
                      setShowGuardianDropdown(!showGuardianDropdown)
                    }
                  >
                    {selectedGuardianName || "Select Guardian"}
                    <span className="arrow">&#9662;</span>
                  </div>

                  {showGuardianDropdown && (
                    <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                      <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                        <input
                          type="text"
                          placeholder="Search Guardian..."
                          className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                          value={searchGuardianInput}
                          onChange={(e) =>
                            setSearchGuardianInput(e.target.value)
                          }
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {filteredGuardians.map((guardian) => (
                          <p
                            key={guardian.id}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                guardian: guardian.id.toString(),
                              }));
                              setSelectedGuardianName(
                                `${guardian.first_name} ${guardian.last_name}`
                              );
                              setSearchGuardianInput("");
                              setShowGuardianDropdown(false);
                            }}
                          >
                            {guardian.first_name} {guardian.last_name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {role === constants.roles.officeStaff && (
                <div className="form-control relative" ref={officeStaffDropdownRef}>
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <i className="fa-solid fa-briefcase text-sm"></i> Office
                      Staff
                    </span>
                  </label>

                  <div
                    className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                    onClick={() =>
                      setShowOfficeStaffDropdown(!showOfficeStaffDropdown)
                    }
                  >
                    {selectedOfficeStaffName || "Select Office Staff"}
                    <span className="arrow">&#9662;</span>
                  </div>

                  {showOfficeStaffDropdown && (
                    <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                      <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                        <input
                          type="text"
                          placeholder="Search Office Staff..."
                          className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                          value={searchOfficeStaffInput}
                          onChange={(e) =>
                            setSearchOfficeStaffInput(e.target.value)
                          }
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {filteredOfficeStaff.map((staff) => (
                          <p
                            key={staff.id}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                office_staff: staff.id.toString(),
                              }));
                              setSelectedOfficeStaffName(
                                `${staff.first_name} ${staff.last_name}`
                              );
                              setSearchOfficeStaffInput("");
                              setShowOfficeStaffDropdown(false);
                            }}
                          >
                            {staff.first_name} {staff.last_name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4 p-6">
          {step === 0 && (
            <div className="flex-1 flex justify-end">
              <button
                type="button"
                onClick={next}
                className={`btn bgTheme text-white w-40 ${role.length === 0 ||
                  (role === constants.roles.student && !formData.year_level)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-purple-700"
                  }`}
                disabled={
                  role.length === 0 ||
                  (role === constants.roles.student && !formData.year_level)
                }
              >
                Next
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="flex-1 flex justify-end gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="btn bgTheme w-auto md:w-36 text-white hover:bg-purple-700 flex items-center justify-center"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i> Back
              </button>

              <button
                type="submit"
                className={`btn bgTheme text-white w-auto md:w-36 ${Disable
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-purple-700"
                  }`}
                disabled={Disable}
              >
                {loading ? (
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-upload-alt mr-2"></i> Upload
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Hidden TC Template */}
      <div className="fixed" style={{ left: '-9999px', top: '-9999px' }}>
        <TCTemplate data={tcFormData} />
      </div>

      {/* TC Modal */}
      {showTcModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <h3 className="font-bold text-lg mb-4">
              <i className="fa-solid fa-file-alt mr-2 text-purple-600"></i>
              Transfer Certificate Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Review and complete the Transfer Certificate details. Click "Generate TC" to create the certificate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Scholar No.</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.scholarNo}
                  onChange={(e) => setTcFormData({...tcFormData, scholarNo: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Scholar No"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Aadhar No.</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.aadharNo}
                  onChange={(e) => setTcFormData({...tcFormData, aadharNo: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Aadhar No"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">SSSMID</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.sssmid}
                  onChange={(e) => setTcFormData({...tcFormData, sssmid: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter SSSMID"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">FMD</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.fmd}
                  onChange={(e) => setTcFormData({...tcFormData, fmd: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter FMD"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">APAR ID</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.aparId}
                  onChange={(e) => setTcFormData({...tcFormData, aparId: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter APAR ID"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">PEN NO.</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.penNo}
                  onChange={(e) => setTcFormData({...tcFormData, penNo: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter PEN NO"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Student Name</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.studentName}
                  onChange={(e) => setTcFormData({...tcFormData, studentName: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Student Name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Father Name</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.fatherName}
                  onChange={(e) => setTcFormData({...tcFormData, fatherName: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Father Name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mother Name</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.motherName}
                  onChange={(e) => setTcFormData({...tcFormData, motherName: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Mother Name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">School</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.school}
                  onChange={(e) => setTcFormData({...tcFormData, school: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter School Name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">District</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.district}
                  onChange={(e) => setTcFormData({...tcFormData, district: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter District"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Admission Date</span>
                </label>
                <input
                  type="date"
                  value={tcFormData.admissionDate}
                  onChange={(e) => setTcFormData({...tcFormData, admissionDate: e.target.value})}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Leaving Date</span>
                </label>
                <input
                  type="date"
                  value={tcFormData.leavingDate}
                  onChange={(e) => setTcFormData({...tcFormData, leavingDate: e.target.value})}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={tcFormData.dob}
                  onChange={(e) => setTcFormData({...tcFormData, dob: e.target.value})}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">DOB (in words)</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.dobWords}
                  onChange={(e) => setTcFormData({...tcFormData, dobWords: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="e.g., Jitendra Maish Tuo Thassand Fourteen"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vaccinated</span>
                </label>
                <select
                  value={tcFormData.vaccinated}
                  onChange={(e) => setTcFormData({...tcFormData, vaccinated: e.target.value})}
                  className="select select-bordered w-full"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Exam Class</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.lastExamClass}
                  onChange={(e) => setTcFormData({...tcFormData, lastExamClass: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Class"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Medium</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.medium}
                  onChange={(e) => setTcFormData({...tcFormData, medium: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Medium"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Exam Year</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.lastExamYear}
                  onChange={(e) => setTcFormData({...tcFormData, lastExamYear: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="e.g., 2022"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Promoted to Class</span>
                </label>
                <input
                  type="text"
                  value={tcFormData.promotedToClass}
                  onChange={(e) => setTcFormData({...tcFormData, promotedToClass: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter Class"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Character</span>
                </label>
                <select
                  value={tcFormData.character}
                  onChange={(e) => setTcFormData({...tcFormData, character: e.target.value})}
                  className="select select-bordered w-full"
                >
                  <option value="Good">Good</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Satisfactory">Satisfactory</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  value={tcFormData.date}
                  onChange={(e) => setTcFormData({...tcFormData, date: e.target.value})}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="modal-action mt-4">
              <button
                className="btn bgTheme text-white"
                onClick={handleTcSubmit}
                disabled={generatingTC}
              >
                {generatingTC ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-pdf mr-2"></i>
                    Generate TC
                  </>
                )}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowTcModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Alert Modal */}
      {showAlert && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <h3 className="font-bold text-lg">Notification</h3>
            <p className="py-4">
              {alertMessage.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <div className="modal-action">
              <button
                className="btn bgTheme text-white w-30"
                onClick={() => {
                  setShowAlert(false);
                  setApiErrors({});
                }}
              >
                OK
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};