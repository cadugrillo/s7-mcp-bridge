import fs from 'fs';

interface Plc {
	plcName: string;
	plcIpAddress: string;
}

export const AvailablePLCs = (): Plc[] => {

	const pathToConfig = '/cfg-data/config.json';
	if (fs.existsSync(pathToConfig)) {
		try {
			const data = fs.readFileSync(pathToConfig, 'utf8');
			const config = JSON.parse(data);

			const plcList: Plc[] = [];

			for (let i = 0; i < config.plcIpAddresses.length; i++) {
				if (config.plcIpAddresses[i]) {
					plcList.push({
						plcName: config.plcNames[i] ? config.plcNames[i]!.trim() : `PLC_${i + 1}`,
						plcIpAddress: config.plcIpAddresses[i]!.trim()
					});
				}
			}

			return plcList;

		} catch (err) {
			console.error('Error reading JSON file:', err);
			return [];
		}
	} else {

		process.env["PLC_IP_ADDRESSES"] = process.env["PLC_IP_ADDRESSES"] || "";
		process.env["PLC_NAMES"] = process.env["PLC_NAMES"] || "";

		const plcList: Plc[] = [];

		const plcIpAddresses = process.env["PLC_IP_ADDRESSES"].split(',');
		const plcNames = process.env["PLC_NAMES"] ? process.env["PLC_NAMES"].split(',') : [];

		for (let i = 0; i < plcIpAddresses.length; i++) {
			if (plcIpAddresses[i]) {
				plcList.push({
					plcName: plcNames[i] ? plcNames[i]!.trim() : `PLC_${i + 1}`,
					plcIpAddress: plcIpAddresses[i]!.trim()
				});
			}
		}

		return plcList;
	}
}