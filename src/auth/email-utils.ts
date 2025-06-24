

const COLLEGE_DOMAINS = ['cmrit.ac.in', 'iiitb.ac.in'];


export function isCollegeEmail(email: string): boolean {
  const domain = email.split('@')[1].toLowerCase();
  return COLLEGE_DOMAINS.includes(domain);
}