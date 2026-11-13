// ALL site content lives here. Everything is taken from the résumé.
export const DATA = {
  name: 'Shreyas Zadge',
  fullName: 'Shreyas Rajendra Zadge',
  first: 'SHREYAS',
  role: ['JUNIOR JAVA', 'DEVELOPER.'],
  tagline:
    'Entry-level Java developer building REST APIs with Spring Boot, Hibernate and MySQL — with clean React interfaces on top. Three full-stack projects shipped, still learning every day.',
  // *word* = red keyword
  manifesto:
    'I build *backends* that hold together — *Spring Boot* services, clean *REST APIs* and tidy *MySQL* schemas — and *React* front ends that feel good to use. Core Java is my foundation; shipping *complete products* is my habit.',
  stats: [
    { value: '8.26', label: 'CGPA / 10', sub: 'B.E. Computer Engineering' },
    { value: '3', label: 'Full-stack projects', sub: 'Spring Boot + MySQL' },
    { value: '3', label: 'Roles & internships', sub: 'Backend · ML · Marketing' },
  ],
  projects: [
    {
      n: '01',
      cat: 'Full-stack · Inventory',
      title: 'Inventory & Order Management',
      desc: 'Products, suppliers, warehouses and orders with live stock tracking.',
      chips: ['Java', 'Spring Boot', 'MySQL', 'React.js'],
      visual: 'gauge',
    },
    {
      n: '02',
      cat: 'Full-stack · Hiring',
      title: 'Job Portal & Recruitment',
      desc: 'Job posting, candidate applications and resume management with role-based access.',
      chips: ['Java', 'Spring Boot', 'MySQL', 'React.js'],
      visual: 'heat',
    },
    {
      n: '03',
      cat: 'Backend · Commerce',
      title: 'E-Commerce Management',
      desc: 'Catalog, cart, order processing and admin tools with authentication.',
      chips: ['Java', 'Spring Boot', 'Hibernate', 'MySQL'],
      visual: 'orders',
    },
  ],
  journey: {
    startYear: 2022,
    endYear: 2026,
    items: [
      { year: '2026', title: 'Java Development Training', org: 'TechnoLearn Trainings' },
      { year: '2025', title: 'Digital Marketing Executive', org: 'Xpert Media Solutions' },
      { year: '2023', title: 'B.E. Computer Engineering', org: 'MMIT, Pune · SPPU' },
    ],
  },
  skills: [
    'Java', 'Spring Boot', 'Spring MVC', 'Spring Data JPA', 'Hibernate', 'REST APIs', 'JDBC', 'MySQL',
    'React.js', 'JavaScript', 'Python', 'SQL', 'Git', 'Postman', 'Maven', 'JWT',
  ],
  counters: [
    { n: 8.26, dec: 2, suffix: '★', label: 'CGPA out of 10' },
    { n: 3, dec: 0, suffix: '', label: 'Projects shipped' },
    { n: 3, dec: 0, suffix: '', label: 'Roles & internships' },
    { n: 16, dec: 0, suffix: '', label: 'Tools & technologies' },
  ],
  cards: [
    { title: 'Java Development Training', issuer: 'TechnoLearn · 2026' },
    { title: 'B.E. Computer Engineering', issuer: 'MMIT · SPPU · 2023' },
    { title: 'Django Developer Intern', issuer: 'Suven Consultants · 2022' },
    { title: 'Machine Learning Intern', issuer: 'CollegeRanker · 2022' },
    { title: 'Digital Marketing Executive', issuer: 'Xpert Media · 2025' },
    { title: 'Inventory & Order System', issuer: 'Project · Spring Boot' },
    { title: 'Job Portal & Recruitment', issuer: 'Project · Spring Boot' },
    { title: 'E-Commerce Management', issuer: 'Project · Hibernate' },
  ],
  email: 'zadgeshreyas@gmail.com',
  github: 'https://github.com/shreyaszadge',
  linkedin: 'https://www.linkedin.com/in/shreyas-zadge-344a1921b',
  resume: './resume.pdf',
} as const

export const NAV = [
  { id: 'hero', label: 'Hello' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'journey', label: 'Journey' },
  { id: 'skills', label: 'Toolkit' },
  { id: 'awards', label: 'Training' },
  { id: 'contact', label: 'Contact' },
] as const
