import { ClientGeoIP } from "@/app/sysAdmin/geo-ip/client-geo-ip";

export default function GeoIPPage() {
	return (
		<div className="min-h-screen bg-background">
			<ClientGeoIP />
		</div>
	);
}
