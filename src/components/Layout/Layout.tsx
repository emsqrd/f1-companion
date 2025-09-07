import { Outlet } from 'react-router';

import { PageHeader } from '../PageHeader/PageHeader';

export function Layout() {
  return (
    <>
      <PageHeader />
      <Outlet />
    </>
  );
}
