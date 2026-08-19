import "@/app/mylist/mylist.css";

export default function MyListLayout({ children }: LayoutProps<"/mylist">) {
  return <div data-mylist-page="">{children}</div>;
}
