import { LabIcon } from '@jupyterlab/ui-components';

import gramps_citation_svg from './gramps-citation.svg';
import gramps_event_svg from './gramps-event.svg';
import gramps_media_svg from './gramps-media.svg';
import gramps_note_svg from './gramps-notes.svg';
import gramps_person_svg from './gramps-person.svg';
import gramps_place_svg from './gramps-place.svg';
import gramps_repository_svg from './gramps-repository.svg';
import gramps_source_svg from './gramps-source.svg';
import gramps_family_svg from './person-family.svg';

const citationIcon = new LabIcon({
    name: 'gprime-icon:gramps-citation',
    svgstr: gramps_citation_svg
});				

const eventIcon = new LabIcon({
    name: 'gprime-icon:gramps-event',
    svgstr: gramps_event_svg
});				

const mediaIcon = new LabIcon({
    name: 'gprime-icon:gramps-media',
    svgstr: gramps_media_svg
});				

const noteIcon = new LabIcon({
    name: 'gprime-icon:gramps-note',
    svgstr: gramps_note_svg
});				

const personIcon = new LabIcon({
    name: 'gprime-icon:gramps-person',
    svgstr: gramps_person_svg
});				

const placeIcon = new LabIcon({
    name: 'gprime-icon:gramps-place',
    svgstr: gramps_place_svg
});				

const repositoryIcon = new LabIcon({
    name: 'gprime-icon:gramps-repository',
    svgstr: gramps_repository_svg
});				

const sourceIcon = new LabIcon({
    name: 'gprime-icon:gramps-source',
    svgstr: gramps_source_svg
});				

const familyIcon = new LabIcon({
    name: 'gprime-icon:gramps-family',
    svgstr: gramps_family_svg
});				

export const ICON_TABLE: {[key: string]: LabIcon} = {
    "citation": citationIcon,
    "event": eventIcon,
    "media": mediaIcon,
    "note": noteIcon,
    "person": personIcon,
    "place": placeIcon,
    "repository": repositoryIcon,
    "source": sourceIcon,
    "family": familyIcon
}
