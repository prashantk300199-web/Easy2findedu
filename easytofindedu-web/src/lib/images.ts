const B = 'https://images.unsplash.com/photo-';
const Q = '?auto=format&fit=crop&w=1920&q=85';

export const IMG = {
  hero:          `${B}1562774053-701939374585${Q}`,
  colleges:      `${B}1571260899304-425eee4c7efc${Q}`,
  abroad:        `${B}1527066579998-dbbae57f45ce${Q}`,
  online:        `${B}1593642632559-0c6d3fc62b89${Q}`,
  career:        `${B}1507003211169-0a1dd7228f2d${Q}`,
  institutes:    `${B}1580582932707-520aed937b7b${Q}`,
  hostels:       `${B}1555854877-bab0e564b8d5${Q}`,
  hostelHero:    `${B}1503676260728-1c00da094a0b${Q}`,
  instituteHero: `${B}1524178232363-1fb2b075b655${Q}`,
  collegeHero:   `${B}1496307653780-42ee777d4833${Q}`,
  journalHero:   `${B}1434030216411-0b793f4b4173${Q}`,
  careerHero:    `${B}1523240795612-9a054b0db644${Q}`,
  careerBand:    `${B}1576091160550-2173dba999ef${Q}`,
  room:          `${B}1570168007204-dfb528c6958f${Q}`,
  laptop:        `${B}1488190211105-8b0e65b80b4e${Q}`,
  college: {
    nursing1:    `${B}1551190822-a9333d879b1f${Q}`,
    nursing2:    `${B}1576091160399-112ba8d25d1d${Q}`,
    nursing3:    `${B}1456513080510-7bf3a84b82f8${Q}`,
    it1:         `${B}1547658719-da2b51169166${Q}`,
    it2:         `${B}1498050108023-c5249f4df085${Q}`,
    general1:    `${B}1580582932707-520aed937b7b${Q}`,
    general2:    `${B}1535982330050-f1c2fb79ff78${Q}`,
    general3:    `${B}1524178232363-1fb2b075b655${Q}`,
  },
} as const;

/**
 * Real building/campus photos fetched from each college's own website.
 * Verified HTTP 200 before inclusion. 5 of 10 colleges had accessible
 * photos; the other 5 fall back to category Unsplash images via getCollegeImage().
 */
export const COLLEGE_REAL_PHOTOS: Record<string, string> = {
  // Impact College — ads_banner from impactcollege.edu.in
  '6a54abe324898b310b2d2244':
    'https://www.impactcollege.edu.in/ads_banner/banner_1782215782_859.png',
  // Priyadarshini College of Nursing — "Front view" banner from priyadarshininursing.in
  '6a54a27c24898b310b2d2234':
    'https://priyadarshininursing.in/wp-content/uploads/2025/07/banner-1.jpg',
  // Basudeo Institute of Nursing Science — building exterior from binspatna.com (hosted on Zyro CDN)
  '6a535c5e24898b310b2d1fb6':
    'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/fh1mrvGPt6N2o9TX/basudeo-institute-of-nursing-science-patna-colleges-jy9hquu5xc-q2YppfXPYUGdBclw.jpg',
  // Pragati Group of Education — slider photo from pragatigroupofeducation.com
  '6a525ba724898b310b2d1e74':
    'https://www.pragatigroupofeducation.com/uploads/slider/pragati-banner-5.jpg',
  // National Institute of Health Education & Research — slider from niher.org.in
  '6a51f1fc24898b310b2d1e2b':
    'https://www.niher.org.in/Admin/slider/9673166n4n4971acd7-9531-426c-9538-8e5fbfea50a1.jpg',
};
