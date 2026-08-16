export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/archive", label: "Archive" },
  { href: "/mylist", label: "My List" },
];

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/browse") {
    return pathname.startsWith("/browse") || pathname.startsWith("/anime/") || pathname.startsWith("/manga/");
  }
  return pathname.startsWith(href);
}
