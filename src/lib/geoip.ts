import { Reader, ReaderModel } from '@maxmind/geoip2-node'
import path from 'path'
import fs from 'fs'

let readerPromise: Promise<ReaderModel> | null = null

const DB_PATH = path.join(process.cwd(), 'data', 'GeoLite2-Country.mmdb')

function getReader(): Promise<ReaderModel> {
  if (!readerPromise) {
    readerPromise = Reader.open(DB_PATH).catch((err) => {
      readerPromise = null
      throw err
    })
  }
  return readerPromise
}

export function isGeoIPAvailable(): boolean {
  return fs.existsSync(DB_PATH)
}

export async function lookupCountry(ip: string): Promise<string | null> {
  if (!ip || !isGeoIPAvailable()) {
    return null
  }

  // Skip private/local IPs
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  ) {
    return null
  }

  try {
    const reader = await getReader()
    const response = reader.country(ip)
    return response.country?.names?.en ?? null
  } catch {
    return null
  }
}
