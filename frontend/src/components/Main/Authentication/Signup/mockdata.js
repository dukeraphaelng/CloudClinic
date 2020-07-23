import faker from 'faker';
const email = () => faker.internet.email();
const newEmail = email();

export const mockForm = {
  firstName: 'Lisa',
  lastName: 'Huang',
  title: 'Mr',
  sex: 'female',
  weight: '55',
  dateOfBirth: '05/11/1999',
  phoneNumber: '04104820594',
  email: `${newEmail}`,
  password: '123456789',
  confirmPassword: '123456789',
  isDoctor: 'true',
  address: {
    number: '4',
    street: 'Beamish Street',
    city: 'Sydney',
    state: 'New South Wales',
    country: 'Australia',
    postcode: '2149',
  },
  doctorInfo: {
    licence: 'MIT',
    accreditations: ['USyd', 'UNSW'],
    specialtyField: 'Dentistry',
    subSpecialtyField: 'Prosthodontics',
    education: ['ANU', 'Macquarie University'],
    yearsExperience: '10',
    tags: ['Orthodontics', 'Prosthodontics'],
    languagesSpoken: ['Cantonese', 'Mandarin', 'Japanese', 'English'],
  },
  clientInfo: {
    medicalHistory: [
      {
        startDate: '03/05/2005',
        condition: 'High Blood Pressure',
        notes: 'Due to old age',
      },
      {
        startDate: '11/11/2003',
        condition: 'Pneumonia',
        notes: 'Due to travel to Africa',
      },
    ],
    allergies: [
      {
        name: 'Dust allergy',
        severity: '3',
      },
      {
        name: 'Pollen allergy',
        severity: '2',
      },
    ],
    medication: [
      {
        name: 'Magic mushroom',
        dosage: '200',
        manufacturer: 'Brazil',
      },
      {
        name: 'Cannabis',
        dosage: '100',
        manufacturer: 'Australia',
      },
    ],
    bloodType: 'A+',
  },
};
