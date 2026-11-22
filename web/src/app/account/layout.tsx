type Params = Promise<{}>;

export default async function AuthLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Params;
}) {
	return (
		<>
			<div className="bg-no-repeat bg-[url('/img/beams/hero@75.jpg')] dark:bg-[url('/img/beams/hero-dark@90.jpg')]">
				<main className="">{children}</main>
			</div>
		</>
	);
}
