# Provider Status Audit

## 1. CircleFTP
- **Type**: Movies / Series
- **Host**: `http://new.circleftp.net:5000` / `http://15.1.1.50:5000`
- **Reachability**: Reached successfully (HTTP 200 OK)
- **Status**: **WORKING**
- **Notes**: The provider API is publicly reachable or correctly routed from the current environment. Media details and URLs can be resolved.

## 2. Dflix / DiscoveryFTP
- **Type**: Movies / Series
- **Host**: `https://movies.discoveryftp.net`
- **Reachability**: Failed (Unable to connect to the remote server / Connection timed out)
- **Status**: **NETWORK_RESTRICTED**
- **Notes**: The provider host is inaccessible. Since it's a BDIX FTP server, it likely requires an ISP within Bangladesh connected to BDIX. Cannot be exposed as a working production source at the moment.

## 3. MyMovieBazar TV
- **Type**: Live TV
- **Host**: `https://tv.mymoviebazar.net`
- **Reachability**: Failed (Connection timed out)
- **Status**: **NETWORK_RESTRICTED**
- **Notes**: The server is unreachable from the current network, consistent with typical BDIX routing restrictions.

## 4. RoarZone TV
- **Type**: Live TV
- **Host**: `http://tv.roarzone.info`
- **Reachability**: Failed (DNS resolution failed - 'tv.roarzone.info')
- **Status**: **BROKEN**
- **Notes**: The domain cannot be resolved. The provider might be defunct or the domain is dead.
