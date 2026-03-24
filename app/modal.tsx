import { Redirect } from 'expo-router';

export default function ModalScreen() {
  // Redirect to add-task instead
  return <Redirect href="/add-task" />;
}
