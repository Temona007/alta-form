import React, { useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { getOrCreatePersonByEmail, addNote } from './API/followupboss';
import 'bootstrap/dist/css/bootstrap.min.css';
// import AddressInput from './AddressInput';

  function App() {
    
    const [formData, setFormData] = useState({
      contactPerson: '',
      personName: '',
      personEmail: '',
      personTel: '',
      role: '',
      otherOwner: false,
      contactNameOtherThanOwner: '',
      contactEmailOtherThanOwner: '',
      contactTelOtherThanOwner: '',
      address: '',
      appartment: '',
      bed: '',
      bath: '',
      sqft: '',
      furnished: '',
      unresolvedIssues: false,
      resolvedIssues: false,
      unresolvedIssuesDetails: '',
      resolvedIssuesDetails: '',
      tenantName: '',
      occupantsNumber: '',
      occupancyYears: '',
      previousIssues: '',
      leaseStartDate: '',
      leaseEndDate: '',
      rentDueDate: '',
      renewalDeadline: '',
      renewableLease: '',
      uploadLease: '',
      currentRent: '',
      servicesIncluded: '',
      specialArrangements: '',
      propertyManagerName: '',
      propertyManagerEmail: '',
      propertyManagerPhoneNumber: '',
      condoManager: '',
      deskPersonnelNames: '',
      frontDeskPhone: '',
      frontDeskEmail: '',
      existingContracts: '',
      existingContractsDetails: '',
      generalCleaning: '',
      generalCleaningDetails: '',
      painting: '',
      paintingDetails: '',
      floors: '',
      floorsDetails: '',
      appliances: '',
      appliancesDetails: '',
      plumber: '',
      plumberDetails: '',
      hvac: '',
      hvacDetails: '',
      miscHandyman: '',
      miscHandymanDetails: '',
      insuranceCarrier: '',
      policyNumber: ''
    });

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [emptyFields, setEmptyFields] = useState({});

    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 7;

    const stepFields = {
        0: formData.otherOwner
          ? ['contactNameOtherThanOwner', 'contactEmailOtherThanOwner', 'contactTelOtherThanOwner']
          : ['personName', 'personEmail', 'personTel', 'role'],
        1: ['address', 'bed', 'bath', 'sqft', 'furnished', 'unresolvedIssues', 'resolvedIssues'], // 'appartment'
        2: ['tenantName',], // removed 'previousIssues', 'occupantsNumber', 'occupancyYears',
        3: ['leaseStartDate', 'leaseEndDate', 'renewableLease', 'currentRent',  ], // removed 'uploadLease', 'servicesIncluded', 'renewalDeadline',
        4: ['condoManager', ], // 'propertyManagerName', 'propertyManagerEmail', 'propertyManagerPhoneNumber', 'deskPersonnelNames', 'frontDeskPhone', 'frontDeskEmail'
        5: ['existingContracts', 'generalCleaning', 'painting', 'floors', 'appliances', 'plumber', 'hvac', 'miscHandyman'],
        6: ['insuranceCarrier', 'policyNumber']
      };

    const [autocomplete, setAutocomplete] = useState(null);

    // Libraries required for Google Maps API (commented out as not used in current implementation)
    // const libraries = ['places'];

    // Callback when the Autocomplete component loads
    const onLoad = (autocompleteInstance) => {
      setAutocomplete(autocompleteInstance);
    };
    
    // Callback when a place is selected
    const onPlaceChanged = () => {
      if (autocomplete !== null) {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setFormData({ ...formData, address: place.formatted_address });
          setEmptyFields({ ...emptyFields, address: false });
        }
      }
    };

     const handleChange = (e) => {
      const { name, value, files, type } = e.target;
      
      // Handle radio inputs
      if (type === 'radio') {
        setFormData({ 
          ...formData, 
          [name]: value === 'yes' // Convert radio value to boolean
        });
      } else {
        // Handle other input types (text, file, etc.)
        setFormData({ 
          ...formData, 
          [name]: files ? files[0] : value 
        });
      }
      
      // Clear the empty field notification when the user interacts with the field
      setEmptyFields({ ...emptyFields, [name]: false });
    };


    const sharedOptions = ['Building Staff', 'Outside Contractor', 'None'];

    const handleSubmit = async(e) => {
      e.preventDefault();
      const newEmptyFields = {};

  // Validate fields for the current step
    stepFields[currentStep].forEach((key) => {
      newEmptyFields[key] = !formData[key] || formData[key] === '';
    });

    // Handle conditional fields for specific steps
    if (currentStep === 1) {
      if (formData.unresolvedIssues === 'yes') {
        newEmptyFields.unresolvedIssuesDetails = !formData.unresolvedIssuesDetails;
      }
      if (formData.resolvedIssues === 'yes') {
        newEmptyFields.resolvedIssuesDetails = !formData.resolvedIssuesDetails;
      }
    } else if (currentStep === 5) {
      if (formData.existingContracts === 'yes') {
        newEmptyFields.existingContractsDetails = !formData.existingContractsDetails;
      }
      ['generalCleaning', 'painting', 'floors', 'appliances', 'plumber', 'hvac', 'miscHandyman'].forEach((field) => {
        if (formData[field] === 'Building Staff' || formData[field] === 'Outside Contractor') {
          newEmptyFields[`${field}Details`] = !formData[`${field}Details`];
        }
      });
    }

    // Update emptyFields state to show errors
    setEmptyFields({ ...emptyFields, ...newEmptyFields });

  // Check if all required fields in the current step are filled
    const allFilled = stepFields[currentStep].every((key) => !newEmptyFields[key]) &&
    (currentStep !== 1 || (
      (formData.unresolvedIssues !== 'yes' || formData.unresolvedIssuesDetails) &&
      (formData.resolvedIssues !== 'yes' || formData.resolvedIssuesDetails)
    )) &&
    (currentStep !== 5 || (
      (formData.existingContracts !== 'yes' || formData.existingContractsDetails) &&
      ((formData.generalCleaning !== 'Building Staff' && formData.generalCleaning !== 'Outside Contractor') || formData.generalCleaningDetails) &&
      ((formData.painting !== 'Building Staff' && formData.painting !== 'Outside Contractor') || formData.paintingDetails) &&
      ((formData.floors !== 'Building Staff' && formData.floors !== 'Outside Contractor') || formData.floorsDetails) &&
      ((formData.appliances !== 'Building Staff' && formData.appliances !== 'Outside Contractor') || formData.appliancesDetails) &&
      ((formData.plumber !== 'Building Staff' && formData.plumber !== 'Outside Contractor') || formData.plumberDetails) &&
      ((formData.hvac !== 'Building Staff' && formData.hvac !== 'Outside Contractor') || formData.hvacDetails) &&
      ((formData.miscHandyman !== 'Building Staff' && formData.miscHandyman !== 'Outside Contractor') || formData.miscHandymanDetails)
    ));

    if (allFilled) {
      if (currentStep === totalSteps - 1) {
        setShowConfirmation(true);

        console.log('Submitting to Follow Up Boss...');
        // Submit to Follow Up Boss
        try {
          // After creating/finding the person
          const person = await getOrCreatePersonByEmail({
            firstName: formData.personName?.split(' ')[0] || '',
            lastName: formData.personName?.split(' ').slice(1).join(' ') || '',
            email: formData.personEmail,
            phone: formData.personTel,
            tags: ['Alta Lead'],
            stage: 'Property Management Lead',
            source: 'Owners Intake Survey Form',
          });

          // Build a comprehensive note from all filled fields
          const lines = [];
          Object.entries(formData).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            const label = fieldLabels[key] || key;
            const display =
              value instanceof File ? value.name :
              typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
              Array.isArray(value) ? value.join(', ') :
              String(value);
            lines.push(`${label}: ${display}`);
          });

          const noteText =
            `Alta Property Management submission\n` +
            (formData.address ? `Address: ${formData.address}\n` : '') +
            `\n` +
            lines.join('\n');

          // Send note to FUB (Netlify function converts 'text' -> 'body')
          await addNote({
            personId: person.id,
            text: noteText
          });

          console.log('Follow Up Boss note added successfully');
          console.log('Complete Follow Up Boss submission successful:', person);
        } catch (error) {
          console.error('Follow Up Boss submission error:', error);
          console.error('Error details:', error.message);
          console.log('Follow Up Boss submission error:', error);
          // Don't block the form submission if FUB fails
        }
        
      } else {
        // Move to next step
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      }
    }
  };

    // Map field names to user-friendly labels
   
    const fieldLabels = {
      contactPerson: 'Contact Person',
      personName: 'Owner Name',
      personEmail: 'Owner Email',
      personTel: 'Owner Phone Number',
      role: 'Contact Person Role',
      otherOwner: 'Contact Person Other Than Owner',
      contactNameOtherThanOwner: 'Contact Person Name (Non-Owner)',
      contactEmailOtherThanOwner: 'Contact Person Email (Non-Owner)',
      contactTelOtherThanOwner: 'Contact Person Phone Number (Non-Owner)',
      address: 'Property Address',
      appartment: 'Apartment Number',
      bed: 'Number of Bedrooms',
      bath: 'Number of Bathrooms',
      sqft: 'Square Footage',
      furnished: 'Furnished Status',
      unresolvedIssues: 'Unresolved Maintenance Issues',
      unresolvedIssuesDetails: 'Unresolved Maintenance Issues Details',
      resolvedIssues: 'Resolved Maintenance Issues',
      resolvedIssuesDetails: 'Resolved Maintenance Issues Details',
      tenantName: 'Current Leaseholder Name(s)',
      occupantsNumber: 'Number of Additional Occupants',
      occupancyYears: 'Total Years of Occupancy',
      previousIssues: 'Previous Issues/Background',
      leaseStartDate: 'Lease Start Date',
      leaseEndDate: 'Lease End Date',
      rentDueDate: 'Rent Due Date',
      renewalDeadline: 'Renewal Notification Deadline',
      renewableLease: 'Renewable Lease',
      uploadLease: 'Uploaded Lease',
      currentRent: 'Current Rent Amount',
      servicesIncluded: 'Services Included',
      specialArrangements: 'Special Arrangements',
      propertyManagerName: 'Property Manager Name',
      propertyManagerEmail: 'Property Manager Email',
      propertyManagerPhoneNumber: 'Property Manager Phone Number',
      condoManager: 'Condominium Management Company',
      deskPersonnelNames: 'Front Desk Personnel Names',
      frontDeskPhone: 'Front Desk Phone Number',
      frontDeskEmail: 'Front Desk Email',
      existingContracts: 'Existing Service Contracts',
      existingContractsDetails: 'Service Contract Details',
      generalCleaning: 'General Cleaning',
      generalCleaningDetails: 'General Cleaning Details',
      painting: 'Painting',
      paintingDetails: 'Painting Details',
      floors: 'Floors',
      floorsDetails: 'Floors Details',
      appliances: 'Appliances',
      appliancesDetails: 'Appliances Details',
      plumber: 'Plumber',
      plumberDetails: 'Plumber Details',
      hvac: 'HVAC',
      hvacDetails: 'HVAC Details',
      miscHandyman: 'Miscellaneous Handyman',
      miscHandymanDetails: 'Miscellaneous Handyman Details',
      insuranceCarrier: 'Insurance Carrier',
      policyNumber: 'Policy Number'
    };

    return (
      <div className="container py-5">
        <div className='row justify-content-md-center'>
          <div className='col-lg-7'>
            <h1 className="text-center text-navy mb-4" style={{ color: '#1a2a44' }}>Owners Intake Survey</h1>

            {/* <AddressInput formData={formData} handleChange={handleChange} /> */}

            {/* PROGRESS */}
            {!showConfirmation && (
              <div className="progress mb-5">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  aria-valuenow={(currentStep + 1) / totalSteps * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  Step {currentStep + 1} of {totalSteps}
                </div>
              </div>
            )}
            
            <div className="card shadow-sm">
              {/* Owner Info */}
              <div className={`card-header ${currentStep === 0 ? 'show' : 'hide'}`}>Owner Info</div>
              <div className={`card-body ${currentStep === 0 ? 'show' : 'hide'}`}>

                {/* OWNER */}
                 {formData.otherOwner === false && (
                    <span>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        name="personName" 
                        value={formData.personName} 
                        onChange={handleChange} 
                        className="form-control" 
                        required 
                      />
                      {emptyFields.personName && (
                        <small className="text-danger">Please enter the owner's name</small>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        name="personEmail" 
                        value={formData.personEmail} 
                        onChange={handleChange} 
                        className="form-control" 
                        required 
                      />
                      {emptyFields.personEmail && (
                        <small className="text-danger">Please enter a valid email address</small>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        name="personTel" 
                        value={formData.personTel} 
                        onChange={handleChange} 
                        className="form-control" 
                        required 
                      />
                      {emptyFields.personTel && (
                        <small className="text-danger">Please enter the owner's phone number</small>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contact Person Role</label>
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        className="form-select" 
                        required
                      >
                        <option value="">Select...</option>
                        <option value="Owner">Owner</option>
                        <option value="Assistant">Assistant</option>
                        <option value="Spouse">Spouse</option>
                      </select>
                      {emptyFields.role && (
                        <small className="text-danger">Please select a contact person role</small>
                      )}
                    </div>
                  </span>
                 )}

                {/* Other than Owner */}
                {formData.otherOwner === true && (
                  <div>
                   <div className="mb-3">
                    <label className="form-label">Contact person Name</label>
                    <input 
                      type="text" 
                      name="contactNameOtherThanOwner" 
                      value={formData.contactNameOtherThanOwner} 
                      onChange={handleChange} 
                      className="form-control" 
                      required 
                    />
                    {emptyFields.contactNameOtherThanOwner && (
                      <small className="text-danger">Please enter the contact person name</small>
                    )}
                  </div>
                <div className="mb-3">
                  <label className="form-label">Contact person Email</label>
                  <input 
                    type="email" 
                    name="contactEmailOtherThanOwner" 
                    value={formData.contactEmailOtherThanOwner} 
                    onChange={handleChange} 
                    className="form-control" 
                    required 
                  />
                  {emptyFields.contactEmailOtherThanOwner && (
                    <small className="text-danger">Please enter a valid email address</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Contact person Phone Number</label>
                  <input 
                    type="tel" 
                    name="contactTelOtherThanOwner" 
                    value={formData.contactTelOtherThanOwner} 
                    onChange={handleChange} 
                    className="form-control" 
                    required 
                  />
                  {emptyFields.contactTelOtherThanOwner && (
                    <small className="text-danger">Please enter the contact person phone number</small>
                  )}
                </div>
                </div>
                )}

                <div className="mb-3 contact-property-block">
                  <label className="form-label">Contact person for property (if other than owner)</label>
                  <br/>
                  <input type="radio" class="btn-check" name="otherOwner" id="yes" autocomplete="off" value="yes" checked={formData.otherOwner === true} onChange={handleChange}/>
                  <label 
                  className={`btn-radio ${formData.otherOwner === true ? 'selected' : 'unselected'}`}  htmlFor="yes">Yes</label>
                  <input type="radio" class="btn-check" name="otherOwner" id="no" autocomplete="off" value="no" checked={formData.otherOwner === false} onChange={handleChange}/>
                  <label className={`btn-radio ${formData.otherOwner === false ? 'selected' : 'unselected'}`} htmlFor="no">No</label>
                </div>

              </div>

              {/* Property */}
              <div className={`card-header ${currentStep === 1 ? 'show' : 'hide'}`} id="property">Property</div>
              <div className={`card-body ${currentStep === 1 ? 'show' : 'hide'}`}>
                <div className="row">
                  <div className="mb-3 col-md-7">
                    <label className="form-label">Address</label>
                    <Autocomplete
                      onLoad={onLoad}
                      onPlaceChanged={onPlaceChanged}
                      restrictions={{ country: 'us' }} // Restrict to USA
                    >
                      <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder='City, neighbourhood or ZIP code ...'
                      />
                    </Autocomplete>
                    {emptyFields.address && (
                      <small className="text-danger">Please enter the property address</small>
                    )}
                  </div>
                  <div className="mb-3 col-md-5" id='appartment'>
                    <label className="form-label">Apt</label>
                    <input 
                      type="text" 
                      name="appartment" 
                      value={formData.appartment} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.appartment && (
                      <small className="text-danger">Please enter the apartment number</small>
                    )}
                  </div>
                </div>
                <div className="row justify-content-between">
                  <div className="mb-3 col-auto" id='bed'>
                    <label className="form-label">Bed</label> 
                    <input 
                      type="text" 
                      name="bed" 
                      value={formData.bed} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.bed && (
                      <small className="text-danger">Please enter the number of bedrooms</small>
                    )}
                  </div>
                  <div className="mb-3 col-auto" id='bath'>
                    <label className="form-label">Bath</label> 
                    <input 
                      type="text" 
                      name="bath" 
                      value={formData.bath} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.bath && (
                      <small className="text-danger">Please enter the number of bathrooms</small>
                    )}
                  </div>
                  <div className="mb-3 col-auto" id='sqft'>
                    <label className="form-label">Sqft</label> 
                    <input 
                      type="text" 
                      name="sqft" 
                      value={formData.sqft} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.sqft && (
                      <small className="text-danger">Please enter the property square footage</small>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Furnished?</label>
                  <select 
                    name="furnished" 
                    value={formData.furnished} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {emptyFields.furnished && (
                    <small className="text-danger">Please select whether the property is furnished</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Unresolved Maintenance Issues</label>
                  <select 
                    name="unresolvedIssues" 
                    value={formData.unresolvedIssues} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                   {emptyFields.unresolvedIssues && (
                    <small className="text-danger">Please select if there are any unresolved maintenance issues</small>
                  )}
                </div>
                {formData.unresolvedIssues === 'yes' && (
                  <div className="mb-3">
                    <label className="form-label">Maintenance Issues Details</label>
                    <textarea 
                      name="unresolvedIssuesDetails" 
                      value={formData.unresolvedIssuesDetails} 
                      onChange={handleChange} 
                      className="form-control"
                    />
                    {emptyFields.unresolvedIssuesDetails && (
                      <small className="text-danger">Please enter maintenance issues</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Resolved Maintenance Issues</label>
                  <select 
                    name="resolvedIssues" 
                    value={formData.resolvedIssues} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {emptyFields.resolvedIssues && (
                    <small className="text-danger">Please select if there are any resolved maintenance issues</small>
                  )}
                  {formData.resolvedIssues === 'yes' && (
                    <div className="mb-3 pt-3">
                      <label className="form-label">Resolved Maintenance Issues Details</label>
                      <textarea 
                        name="resolvedIssuesDetails" 
                        value={formData.resolvedIssuesDetails} 
                        onChange={handleChange} 
                        className="form-control"
                      />
                      {emptyFields.resolvedIssuesDetails && (
                        <small className="text-danger">Please enter resolved maintenance issues</small>
                      )}
                    </div>
                  )

                  }
                </div>
              </div>

            {/* Tenant Info */}
              <div className={`card-header ${currentStep === 2 ? 'show' : 'hide'}`}>Tenant Info</div>
              <div className={`card-body ${currentStep === 2 ? 'show' : 'hide'}`}>
                <div className="mb-3">
                  <label className="form-label">Name of Current Leaseholder(s)</label>
                  <input 
                    type="text" 
                    name="tenantName" 
                    value={formData.tenantName} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.tenantName && (
                    <small className="text-danger">Please enter the name of the current leaseholder</small>
                  )}
                </div>
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Additional Occupants</label>
                    <input 
                      type="text" 
                      name="occupantsNumber" 
                      value={formData.occupantsNumber} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.occupantsNumber && (
                      <small className="text-danger">Please enter the number of additional occupants</small>
                    )}
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">How many total years of occupancy</label>
                    <input 
                      type="text" 
                      name="occupancyYears" 
                      value={formData.occupancyYears} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.occupancyYears && (
                      <small className="text-danger">Please enter the total years of occupancy</small>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Any previous issues / background</label>
                  <textarea 
                    rows={2}
                    // type="text" 
                    name="previousIssues" 
                    value={formData.previousIssues} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.previousIssues && (
                    <small className="text-danger">Please provide any known tenant issues or background information</small>
                  )}
                </div>
              </div>

            {/* Current Lease */}
              <div className={`card-header ${currentStep === 3 ? 'show' : 'hide'}`}>Current Lease</div>
              <div className={`card-body ${currentStep === 3 ? 'show' : 'hide'}`}>
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Start date</label>
                    <input 
                      type="date" 
                      name="leaseStartDate" 
                      value={formData.leaseStartDate} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.leaseStartDate && (
                      <small className="text-danger">Please enter the lease start date</small>
                    )}
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">End date</label>
                    <input 
                      type="date" 
                      name="leaseEndDate" 
                      value={formData.leaseEndDate} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.leaseEndDate && (
                      <small className="text-danger">Please enter the lease end date</small>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Renewable lease?</label>
                    <select 
                      name="renewableLease" 
                      value={formData.renewableLease} 
                      onChange={handleChange} 
                      className="form-select"
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {emptyFields.renewableLease && (
                      <small className="text-danger">Please select whether the lease is renewable</small>
                    )}
                  </div>
                  {(formData.renewableLease === 'yes' || formData.renewableLease === '' ) && (
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Renewal notification deadline</label>
                      <input 
                        type="date" 
                        name="renewalDeadline" 
                        value={formData.renewalDeadline} 
                        onChange={handleChange} 
                        className="form-control" 
                      />
                      {emptyFields.renewalDeadline && (
                        <small className="text-danger">Please enter the renewal notification deadline</small>
                      )}
                    </div>
                  )}
                </div>
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Current Rent</label>
                    <input 
                      type="text" 
                      name="currentRent" 
                      value={formData.currentRent} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.currentRent && (
                      <small className="text-danger">Please enter the current rent amount</small>
                    )}
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Upload current lease</label>
                    <input 
                      type="file" 
                      name="uploadLease" 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.uploadLease && (
                      <small className="text-danger">Please upload a copy of the current lease</small>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Services included?</label>
                  <textarea 
                    rows={2}
                    name="servicesIncluded" 
                    value={formData.servicesIncluded} 
                    onChange={handleChange} 
                    className="form-control" 
                    placeholder="Water, heat (default) add other" 
                  />
                  {emptyFields.servicesIncluded && (
                    <small className="text-danger">Please list the services included with the lease</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Any Special Arrangements (Optional)</label>
                  <input 
                    type="text" 
                    name="specialArrangements" 
                    value={formData.specialArrangements} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {/* {emptyFields.specialArrangements && (
                    <small className="text-danger">You may enter any special terms or agreements if applicable</small>
                  )} */}
                </div>
              </div>

              {/* Building Info */}
              <div className={`card-header ${currentStep === 4 ? 'show' : 'hide'}`}>Building Info</div>
              <div className={`card-body ${currentStep === 4 ? 'show' : 'hide'}`}>
                <div className="mb-3">
                  <label className="form-label">Condominium Management Company</label>
                  <input 
                    type="text" 
                    name="condoManager" 
                    value={formData.condoManager} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.condoManager && (
                    <small className="text-danger">Please enter the name of the condominium management company</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Building's property manager Name</label>
                  <input 
                    type="text" 
                    name="propertyManagerName" 
                    value={formData.propertyManagerName} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.propertyManagerName && (
                    <small className="text-danger">Please enter the name of the property manager</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Property manager Email</label>
                  <input 
                    type="email" 
                    name="propertyManagerEmail" 
                    value={formData.propertyManagerEmail} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.propertyManagerEmail && (
                    <small className="text-danger">Please enter a valid email address</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Please enter the property manager's phone number</label>
                  <input 
                    type="tel" 
                    name="propertyManagerPhoneNumber" 
                    value={formData.propertyManagerPhoneNumber} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.propertyManagerPhoneNumber && (
                    <small className="text-danger">Please enter the property manager's phone number</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Front Desk Personnel Names</label>
                  <textarea
                    rows={2}
                    name="deskPersonnelNames" 
                    value={formData.deskPersonnelNames} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.deskPersonnelNames && (
                    <small className="text-danger">Please enter the names of the front desk personnel</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Front Desk Phone Number</label>
                  <input 
                    type="text" 
                    name="frontDeskPhone" 
                    value={formData.frontDeskPhone} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.frontDeskPhone && (
                    <small className="text-danger">Please enter the front desk phone number</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Front Desk Email</label>
                  <input 
                    type="email" 
                    name="frontDeskEmail" 
                    value={formData.frontDeskEmail} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.frontDeskEmail && (
                    <small className="text-danger">Please enter a valid email address</small>
                  )}
                </div>
              </div>


              {/* Repairs/Maintenance */}
              <div className={`card-header ${currentStep === 5 ? 'show' : 'hide'}`}>Repairs/Maintenance</div>
              <div className={`card-body ${currentStep === 5 ? 'show' : 'hide'}`}>
                <div className="mb-3">
                  <label className="form-label">Existing Service contracts?</label>
                  <select 
                    name="existingContracts" 
                    value={formData.existingContracts} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {emptyFields.existingContracts && (
                    <small className="text-danger">Please indicate if there are any existing service contracts</small>
                  )}
                </div>
                {formData.existingContracts === 'yes' && (
                    <div className="mb-3">
                      <label className="form-label">Contract Details</label>
                      <textarea 
                        rows={2}
                        name="existingContractsDetails" 
                        value={formData.existingContractsDetails} 
                        onChange={handleChange} 
                        className="form-control" 
                      />
                      {emptyFields.existingContractsDetails && (
                        <small className="text-danger">Please fill in details about existing service contracts</small>
                      )}
                    </div>
                  )
                }
                <div className="mb-3">
                  <label className="form-label">General Cleaning</label>
                  <select 
                    name="generalCleaning" 
                    value={formData.generalCleaning} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.generalCleaning && (
                    <small className="text-danger">Please select the status of general cleaning</small>
                  )}
                </div>
                {(formData.generalCleaning === 'Building Staff' || formData.generalCleaning === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">Cleaning Details</label>
                    <textarea 
                      rows={2}
                      name="generalCleaningDetails" 
                      value={formData.generalCleaningDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.generalCleaningDetails && (
                      <small className="text-danger">Please select the status of general cleaning services</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Painting</label>
                  <select 
                    name="painting" 
                    value={formData.painting} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.painting && (
                    <small className="text-danger">Please select the status of painting services</small>
                  )}
                </div>
                {(formData.painting === 'Building Staff' || formData.painting === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">Painting Details</label>
                    <textarea 
                      rows={2}
                      name="paintingDetails" 
                      value={formData.paintingDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.paintingDetails && (
                      <small className="text-danger">Please add painting details</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Floors</label>
                  <select 
                    name="floors" 
                    value={formData.floors} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.floors && (
                    <small className="text-danger">Please select the status of floor maintenance</small>
                  )}
                </div>
                {(formData.floors === 'Building Staff' || formData.floors === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">Floors Details</label>
                    <textarea 
                      rows={2}
                      name="floorsDetails" 
                      value={formData.floorsDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.floorsDetails && (
                      <small className="text-danger">Please add floor maintenance details</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Appliances</label>
                  <select 
                    name="appliances" 
                    value={formData.appliances} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.appliances && (
                    <small className="text-danger">Please select the status of appliance servicing</small>
                  )}
                </div>
                {(formData.appliances === 'Building Staff' || formData.appliances === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">Appliances Details</label>
                    <textarea 
                      rows={2}
                      name="appliancesDetails" 
                      value={formData.appliancesDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.appliancesDetails && (
                      <small className="text-danger">Please add appliance servicing details</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Plumber</label>
                  <select 
                    name="plumber" 
                    value={formData.plumber} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.plumber && (
                    <small className="text-danger">Please select the status of plumbing services</small>
                  )}
                </div>
                {(formData.plumber === 'Building Staff' || formData.plumber === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">Plumber Details</label>
                    <textarea 
                      rows={2}
                      name="plumberDetails" 
                      value={formData.plumberDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.generalCleaningDetails && (
                      <small className="text-danger">Plumber add plumbing services details</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">HVAC</label>
                  <select 
                    name="hvac" 
                    value={formData.hvac} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.hvac && (
                    <small className="text-danger">Please select the status of HVAC servicing</small>
                  )}
                </div>
                {(formData.hvac === 'Building Staff' || formData.hvac === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">HVAC Details</label>
                    <textarea 
                      rows={2}
                      name="hvacDetails" 
                      value={formData.hvacDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.generalCleaningDetails && (
                      <small className="text-danger">HVAC services details</small>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Misc Handyman</label>
                  <select 
                    name="miscHandyman" 
                    value={formData.miscHandyman} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {sharedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {emptyFields.miscHandyman && (
                    <small className="text-danger">Please select the status of handyman services</small>
                  )}
                </div>
                {(formData.miscHandyman === 'Building Staff' || formData.miscHandyman === 'Outside Contractor') && (
                  <div className="mb-3">
                    <label className="form-label">Misc Handyman Details</label>
                    <textarea 
                      rows={2}
                      name="miscHandymanDetails" 
                      value={formData.miscHandymanDetails} 
                      onChange={handleChange} 
                      className="form-control" 
                    />
                    {emptyFields.generalCleaningDetails && (
                      <small className="text-danger">Please add handyman services details</small>
                    )}
                  </div>
                )}
              </div>

              {/* Insurance */}
              <div className={`card-header ${(currentStep === 6 && !showConfirmation) ? 'show' : 'hide'}`}>Insurance</div>
              <div className={`card-body ${(currentStep === 6 && !showConfirmation) ? 'show' : 'hide'}`}>
                <div className="mb-3">
                  <label className="form-label">Current Owners insurance Carrier</label>
                  <input 
                    type="text" 
                    name="insuranceCarrier" 
                    value={formData.insuranceCarrier} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.insuranceCarrier && (
                    <small className="text-danger">Please enter the name of the current insurance carrier</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Policy Number</label>
                  <input 
                    type="text" 
                    name="policyNumber" 
                    value={formData.policyNumber} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                  {emptyFields.policyNumber && (
                    <small className="text-danger">Please enter the insurance policy number</small>
                  )}
                </div>
              </div>

              {/* Thank You Page */}
              <div className={`card-header ${showConfirmation ? 'show' : 'hide'}`}>Thank You!</div>
              <div  className={`card-body ${showConfirmation ? 'show' : 'hide'}`}>
                <h4>Submission Successful</h4>
                <p>Your information has been submitted successfully. We will review it and get back to you soon.</p>
              </div>

            </div>

            <div className='text-center mt-4'>
              <div className="d-flex justify-content-between1 justify-content-center mb-3">
                {/* BACK */}
                {(currentStep !== 0 && !showConfirmation) && (
                <button
                  type="button"
                  className="submit-btn back-btn" 
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                  disabled={currentStep === 0}
                >
                  Back
                </button>
                )}
                
                {/* NEXT */}
                {currentStep !== totalSteps - 1 && (
                  <button
                    type="button"
                    className="submit-btn"
                    // onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))}
                    onClick={handleSubmit} // Call handleSubmit instead of setCurrentStep
                  >
                    Next
                  </button>
                )}
                
                {/* SUBMIT */}
                {(currentStep === totalSteps -1 && !showConfirmation) && (
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                )}
              </div>
              {/* {currentStep === totalSteps - 2 && (
                <button 
                  type="submit" 
                  className="submit-btn" 
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )} */}
            </div>

            {/* Thank You Page */}
            {/* <div className={`card shadow-sm ${showConfirmation ? 'show' : 'hide'}`}>
              <div className="card-header">Thank You!</div>
              <div className="card-body">
                <h4>Submission Successful</h4>
                <p>Your information has been submitted successfully. We will review it and get back to you soon.</p>
              </div>
            </div> */}

            
            
            {/* {showConfirmation && (
              <div className="mt-4 thanks-message">
                <h4>Thank You!</h4>
                <p>Your information has been submitted successfully. We will review it and get back to you soon.</p>
                <div className="mt-4">
                  <h5>This is demo Submitted Information:</h5>
                  <div className="card">
                    <div className="card-body">
                      {Object.entries(formData).map(([key, value]) => (
                        value && (
                          <div key={key} className="mb-2">
                            <strong>{fieldLabels[key] || key}:</strong> {typeof value === 'object' && value instanceof File ? value.name : value}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )} */}
            {/* {(!showConfirmation && missedUserData) && (
              <div className="mt-4">
                <h5>Please enter user information</h5>
                </div>
              </div>
              
            ))} */}

          </div>
        </div>
      </div>
    );
  }

  export default App;