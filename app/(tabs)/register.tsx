// Check if we're in edit mode
if (isEditMode && params.patientId) {
  // We're updating an existing patient
  const patientId = params.patientId;
  console.log(`Updating patient with ID: ${patientId}`);
  
  // First, get the latest visit for this patient
  const visitsResponse = await fetch(`${API_URL}/visits/patient/${patientId}/recent`);
  if (!visitsResponse.ok) {
    throw new Error(`Failed to fetch visits: ${visitsResponse.status}`);
  }
  
  const visits = await visitsResponse.json();
  if (!visits || visits.length === 0) {
    throw new Error('No visits found for this patient');
  }
  
  const latestVisit = visits[0];
  console.log('Latest visit:', latestVisit);
  
  // First get the current patient data
  const currentPatientResponse = await fetch(`${API_URL}/patients/${patientId}`);
  if (!currentPatientResponse.ok) {
    throw new Error(`Failed to fetch current patient data: ${currentPatientResponse.status}`);
  }
  const currentPatient = await currentPatientResponse.json();
  
  // Prepare patient update data
  const patientUpdateData = {
    name: name || '',
    surname: surname || '',
    fatherName: fatherName || '',
    gender: gender || '',
    age: age ? parseInt(age, 10) : 0,
    phoneNumber: phone || '',
    address: address || '',
    bloodGroup: bloodGroup || ''
  };

  // Remove empty strings to preserve existing data
  Object.keys(patientUpdateData).forEach(key => {
    if (patientUpdateData[key] === '' || patientUpdateData[key] === null) {
      delete patientUpdateData[key];
    }
  });

  console.log('Sending patient update data:', patientUpdateData);

  // Update patient data
  const patientResponse = await fetch(`${API_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientUpdateData)
  });

  if (!patientResponse.ok) {
    const errorText = await patientResponse.text();
    console.error('Failed to update patient:', errorText);
    throw new Error(`Failed to update patient: ${errorText}`);
  }

  const updatedPatient = await patientResponse.json();
  console.log('Updated patient response:', updatedPatient);
  
  // Prepare visit update data
  const visitUpdateData = {
    bp: bloodPressure || '',
    weight: weight || '',
    temperature: temperature || '',
    symptoms: symptoms || '',
    status: status || 'Active',
    complaint: complaint || ''
  };

  // Remove empty strings to preserve existing data
  Object.keys(visitUpdateData).forEach(key => {
    if (visitUpdateData[key] === '') {
      delete visitUpdateData[key];
    }
  });

  console.log('Sending visit update data:', visitUpdateData);

  // Update visit data
  const visitResponse = await fetch(`${API_URL}/visits/${latestVisit.visitId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(visitUpdateData)
  });

  if (!visitResponse.ok) {
    const errorText = await visitResponse.text();
    console.error('Failed to update visit:', errorText);
    throw new Error(`Failed to update visit: ${visitResponse.status}`);
  }

  const updatedVisit = await visitResponse.json();
  console.log('Updated visit response:', updatedVisit);
} else {
  // For new patients, create the patient first, then create a visit separately
  requestData = {
    name,
    surname,
    fatherName,
    gender,
    age: parseInt(age, 10),
    address,
    bloodGroup,
    phoneNumber: phone,
    aadharNumber: aadharNumber
  };
} 