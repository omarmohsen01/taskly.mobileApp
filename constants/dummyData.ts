// Dummy data matching the DB schema from project_management.sql
// This will be replaced with API calls to the backend

export const currentUser = {
  id: 1,
  first_name: 'Alex',
  last_name: 'Hoodie',
  email: 'alex.hoodie@example.com',
  avatar: 'https://i.pravatar.cc/150?img=11',
  phone: '1234567890',
  country_code: '+1',
};

export const users = [
  { id: 1, first_name: 'Alex', last_name: 'Hoodie', email: 'alex.hoodie@example.com', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, first_name: 'John', last_name: 'Deo', email: 'john.deo@example.com', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Product Manager' },
  { id: 3, first_name: 'Alice', last_name: 'Smith', email: 'alice.smith@example.com', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Lead Developer' },
  { id: 4, first_name: 'Robert', last_name: 'King', email: 'robert.king@example.com', avatar: 'https://i.pravatar.cc/150?img=8', role: 'UI/UX Designer' },
  { id: 5, first_name: 'Mariya', last_name: 'Lopez', email: 'mariya.lopez@example.com', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Marketing Coordinator' },
  { id: 6, first_name: 'Sara', last_name: 'Jonson', email: 'sara.jonson@example.com', avatar: 'https://i.pravatar.cc/150?img=23', role: 'Editor' },
];

export const workspaces = [
  { id: 1, name: 'Microsoft Workspaces' },
];

export const spaces = [
  { id: 1, name: 'Excel Space', description: 'Excel Space', workspace_id: 1 },
];

export const projects = [
  {
    id: 1,
    name: 'Mobile App',
    description: 'Mobile application development project',
    access_mode: 'inherit' as const,
    status: 1,
    start_date: '2026-01-15',
    end_date: '2026-06-15',
    space_id: 1,
  },
  {
    id: 2,
    name: 'Prototype',
    description: 'Prototype design project',
    access_mode: 'inherit' as const,
    status: 1,
    start_date: '2026-02-01',
    end_date: '2026-05-01',
    space_id: 1,
  },
];

export const boards = [
  { id: 1, name: 'Main Board', type: 'kanban' as const, project_id: 1 },
];

export const boardColumns = [
  { id: 1, name: 'To Do', position: 1, board_id: 1 },
  { id: 2, name: 'In Progress', position: 2, board_id: 1 },
  { id: 3, name: 'Done', position: 3, board_id: 1 },
];

export const labels = [
  { id: 1, name: 'Landing', color: '#AACAEF', project_id: 1 },
  { id: 2, name: 'Website', color: '#B0B3B8', project_id: 1 },
  { id: 3, name: 'Animation', color: '#B0B3B8', project_id: 1 },
  { id: 4, name: 'Mobile App', color: '#AACAEF', project_id: 1 },
  { id: 5, name: 'Prototype', color: '#B0B3B8', project_id: 1 },
];

export const tasks = [
  {
    id: 1,
    title: 'Learn 3D Modeling in Cinema',
    descriptions: 'Design and share on dribbble',
    priority: 'medium' as const,
    start_date: '2026-05-10',
    due_date: '2026-09-15',
    position: 1,
    board_id: 1,
    board_column_id: 1,
    created_by: 1,
    parent_id: null,
    labels: [1, 2, 3],
    assignees: [1, 2, 3],
    projectName: 'Mobile App',
  },
  {
    id: 2,
    title: 'Complete Landing Page',
    descriptions: 'Design and share on dribbble',
    priority: 'high' as const,
    start_date: '2026-05-01',
    due_date: '2026-09-15',
    position: 2,
    board_id: 1,
    board_column_id: 1,
    created_by: 1,
    parent_id: null,
    labels: [1, 4],
    assignees: [1, 4, 5],
    projectName: 'Mobile App',
  },
  {
    id: 3,
    title: 'Design Concept',
    descriptions: 'Design and share on dribbble',
    priority: 'low' as const,
    start_date: '2026-02-15',
    due_date: '2026-03-01',
    position: 3,
    board_id: 1,
    board_column_id: 2,
    created_by: 2,
    parent_id: null,
    labels: [2],
    assignees: [2, 3],
    projectName: 'Prototype',
  },
  {
    id: 4,
    title: 'Learn 3D Modeling in Cinema 4D',
    descriptions: 'Design and share on dribbble',
    priority: 'medium' as const,
    start_date: '2026-02-15',
    due_date: '2026-04-15',
    position: 4,
    board_id: 1,
    board_column_id: 2,
    created_by: 1,
    parent_id: null,
    labels: [3],
    assignees: [1, 2],
    projectName: 'Prototype',
  },
  {
    id: 5,
    title: 'Design Landing Page',
    descriptions: 'Design and share on dribbble',
    priority: 'urgent' as const,
    start_date: '2026-02-15',
    due_date: '2026-02-28',
    position: 5,
    board_id: 1,
    board_column_id: 3,
    created_by: 1,
    parent_id: null,
    labels: [1],
    assignees: [1],
    projectName: 'Mobile App',
  },
  {
    id: 6,
    title: 'Team Meeting Preparation',
    descriptions: 'Prepare agenda and materials',
    priority: 'high' as const,
    start_date: '2026-02-15',
    due_date: '2026-02-20',
    position: 6,
    board_id: 1,
    board_column_id: 1,
    created_by: 1,
    parent_id: null,
    labels: [4],
    assignees: [1, 2, 3, 4],
    projectName: 'Mobile App',
  },
];

export const taskDetails = {
  id: 1,
  title: 'Your Project B',
  descriptions: 'Design and share on dribbble',
  priority: 'medium' as const,
  subtasks: [
    { id: 1, title: 'Research Phase', completed: true },
    { id: 2, title: 'Initial Architecture', completed: true },
    { id: 3, title: 'Learn 3D Modeling in Cinema 4D', completed: false },
    { id: 4, title: 'Team Meeting Preparation', completed: false },
    { id: 5, title: 'Design Landing Page', completed: false },
  ],
};

export const roles = [
  { id: 1, name: 'Admin', description: 'Full Access to setting and member' },
  { id: 2, name: 'Editor', description: 'Can edit content and project details' },
  { id: 3, name: 'Contributor', description: 'Can add comment and task only' },
  { id: 4, name: 'Viewer', description: 'View only, can not make changes' },
];

export const teams = [
  {
    id: 1,
    name: 'Creative Team',
    created_at: 'Apr 07, 2026',
    is_private: true,
    members: [1, 2, 3, 4],
    taskValue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      data: [30, 45, 28, 50, 40, 60, 35, 55, 42, 48],
    },
  },
];

export const calendarTasks = [
  {
    id: 3,
    title: 'Design Concept',
    description: 'Design and share on dribbble',
    time: '10:00',
    date: '2026-02-15',
  },
  {
    id: 4,
    title: 'Learn 3D Modeling in Cinema 4D',
    description: 'Design and share on dribbble',
    time: '12:00 - 14:00',
    date: '2026-02-15',
  },
  {
    id: 5,
    title: 'Design Landing Page',
    description: 'Design and share on dribbble',
    time: '15:00',
    date: '2026-02-15',
  },
];

export const taskProgress = {
  completed: 12,
  total: 20,
  percentage: 65.50,
};

export const myTaskTabs = ['All', "Today's Task", 'Completed', 'Every'];
