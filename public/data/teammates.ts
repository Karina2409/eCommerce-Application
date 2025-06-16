import { Teammate } from '@models/types/team/teammate.type';

export const team: Teammate[] = [
  {
    name: 'Karina',
    img: 'assets/images/teammates/karina.png',
    git: 'https://github.com/Karina2409',
    role: 'Team lead / Frontend developer',
    bio: '',
    contributions: '',
  },
  {
    name: 'Misha',
    img: 'assets/images/teammates/misha.png',
    git: 'https://github.com/Mishania261282',
    role: 'Frontend developer',
    bio: 'I worked for 5 years in a military specialty, then quit and got a job as an engineer in the maintenance of access control systems, video surveillance, security and fire alarms. At the same time with this, I graduated from educational courses with a degree in System Administration of Windows Server. Then the Front end developer courses at the "Teach Me Skills" educational center, where I got acquainted with the basic HTML and CSS interface technologies and gained practical experience in JavaScript programming.',
    contributions:
      ' CommerceTools project setup, authentication service, authentication tokens handling, products filtering, sorting and searching, CRUD operations for cart entries.',
  },
  {
    name: 'Dzmitry',
    img: 'assets/images/teammates/dzmitry.png',
    git: 'https://github.com/tubyliec',
    role: 'Frontend developer',
    bio: 'I have many years of experience working in a bank. I began learning frontend development through LinkedIn and freeCodeCamp, and later enrolled in RS School.',
    contributions:
      ' Prettier, ESLint, and Husky configuration. Layout for Cart, Catalog, and About pages, along with methods for rendering and functionality of their elements, as well as some methods for API interaction. Some elements on other components.',
  },
];
