import { OverpassNode } from './overpass-api.types';

export class Hydrant {
  id: number;

  lat: number;
  lon: number;

  reference: string;

  private nodeTags: { [key: string]: string };

  constructor(overpassHydrantNode: OverpassNode) {
    this.id = overpassHydrantNode.id;
    this.lat = overpassHydrantNode.lat;
    this.lon = overpassHydrantNode.lon;

    this.nodeTags = overpassHydrantNode.tags || {};

    // the Ref-Text is often used and therefore pre-defined
    this.reference = this.nodeTags['ref'] ?? '??';
  }

  get type(): string {
    const typeTag = this.nodeTags['fire_hydrant:type'];

    switch (typeTag) {
      case 'underground':
        return 'Unterflurhydrant';
      case 'pillar':
        return 'Überflurhydrant';
      case 'wall':
        return 'Wandanschluss';
      case 'pipe':
        return 'Verschlossenes Rohr';
      case 'suction_point':
        return 'Saugstelle';
      case 'pond':
        return 'Teich';
      default:
        return typeTag ? `"${typeTag}"` : '-';
    }
  }

  get position(): string {
    const positionTag = this.nodeTags['fire_hydrant:position'];

    switch (positionTag) {
      case 'green':
        return 'Grünfläche';
      case 'sidewalk':
        return 'Bürgersteig';
      case 'parking_lot':
        return 'Stellplatzfläche';
      case 'lane':
      case 'street':
      case 'roadside':
        return 'Straßenfläche';
      default:
        return positionTag ? `"${positionTag}"` : '-';
    }
  }

  get description(): string {
    const descriptionTag = this.nodeTags['description'];

    return descriptionTag || '-';
  }

  get diameter(): string {
    const diameterTag = this.nodeTags['fire_hydrant:diameter'];
    if (!diameterTag) {
      return '-';
    }

    if (!isNaN(+diameterTag)) {
      return `${diameterTag} mm`;
    }

    return diameterTag;
  }

  get couplingType(): string {
    const couplingTypeTag = this.nodeTags['fire_hydrant:coupling_type'];

    return couplingTypeTag || '-';
  }

  get couplings(): string {
    const couplingsTag =
      this.nodeTags['fire_hydrant:couplings'] || this.nodeTags['couplings'];

    return couplingsTag || '-';
  }

  get operator(): string {
    const operatorTag = this.nodeTags['operator'];

    return operatorTag || '-';
  }

  get waterSource(): string {
    const waterSourceTag = this.nodeTags['water_source'];

    switch (waterSourceTag) {
      // Vordefinierte Einträge in OSM
      case 'main':
        return 'Trinkwassernetz';
      case 'water_tank':
        return 'Wassertank';
      case 'pond':
        return 'Teich';
      case 'stream':
        return 'Bach';

      // Frei vergebene (sinnvolle) Einträge
      case 'groundwater':
        return 'Grundwasser';
      case 'piped':
      case 'water_works':
      case 'wasserleitung':
        return 'Trinkwassernetz';
      case 'powered_pump':
        return 'Pumpe';
      case 'canal':
        return 'Kanal';
      case 'lake':
        return 'See';
      default:
        return waterSourceTag ? `"${waterSourceTag}"` : '-';
    }
  }

  get date(): string {
    const dateTag = this.nodeTags['survey:date'];
    if (!dateTag) {
      return '-';
    }

    const timestamp = Date.parse(dateTag);
    if (Number.isNaN(timestamp)) {
      return '-';
    }

    // Format like '01.09.2023'
    return new Date(timestamp).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
