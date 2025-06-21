'use client';

import Link from 'next/link';

type HeaderProps = {
  currentUser?: { email?: string; id?: string }; // Adjust based on your API
};

export default function Header({ currentUser }: HeaderProps) {
    const routeConfigs = [
      !currentUser && { name: 'Sign In', path: '/auth/signin' },
      !currentUser && { name: 'Sign Up', path: '/auth/signup' },
      currentUser && { name: 'Sign Out', path: '/auth/signout' }
    ].filter(Boolean) as { name: string; path: string }[];

    const routeLinks = routeConfigs.map((route, index) => (
      <li className="nav-item" key={index}>
        <Link href={route.path} className="nav-link">
          {route.name}
        </Link>
      </li>
    ));

    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container">
          <Link href="/" className="navbar-brand">
            Ticko
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              {routeLinks}
            </ul>
          </div>
        </div>
      </nav>
    );
}