// ================================
// FLOWLU CONFIG
// ================================

const FLOWLU_BASE_URL = 'https://cncjobtrackertest.flowlu.com/api/v1';
const FLOWLU_API_KEY = 'aDRhWTNMTWFXcmd2VTV5cVJQeGpTRVdKNWNOMFVxNkNfMTgyOTYy';

const PIPELINE_ID = 2;

// ================================
// STAGE MAP (YOUR PIPELINE)
// ================================

const STAGE_MAP: Record<string, number> = {
  "Interested": 5,
  "Preparing Application": 9,
  "Applied": 6,
  "Follow-Up Needed": 10,
  "Interview Scheduled": 7,
  "Interview Completed": 11,
  "Offer Received": 8,
  "Rejected": 12,
  "Withdrawn": 13,
  "Accepted": 14
};

// ================================
// TYPES
// ================================

export interface Job {
  id: number;
  title: string;
  company_name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// ================================
// HELPERS
// ================================

function encodeForm(data: Record<string, any>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
    .join('&');
}

// Map Flowlu → App
function mapLead(lead: any): Job {
  return {
    id: lead.id,
    title: lead.name,
    company_name: lead.company_name || '',
    status: lead.pipeline_stage_name || '',
    created_at: lead.created_at,
    updated_at: lead.updated_at
  };
}

// ================================
// JOBS (LEADS)
// ================================

// GET JOBS
export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(
    `${FLOWLU_BASE_URL}/module/crm/lead/list?api_key=${FLOWLU_API_KEY}&pipeline_id=${PIPELINE_ID}`
  );

  const json = await res.json();

  if (!json.response?.items) return [];

  return json.response.items.map(mapLead);
}

// CREATE JOB
export async function createJob(job: Partial<Job>): Promise<Job> {

  const stageId = STAGE_MAP[job.status || "Interested"] || 5;

  const body = encodeForm({
    name: job.title,
    pipeline_id: PIPELINE_ID,
    pipeline_stage_id: stageId
  });

  const res = await fetch(
    `${FLOWLU_BASE_URL}/module/crm/lead/create?api_key=${FLOWLU_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }
  );

  const json = await res.json();

  return mapLead(json.response);
}

// UPDATE JOB
export async function updateJob(id: number, updates: Partial<Job>): Promise<Job> {

  const stageId = updates.status ? STAGE_MAP[updates.status] : undefined;

  const body = encodeForm({
    id,
    ...(updates.title && { name: updates.title }),
    ...(stageId && { pipeline_stage_id: stageId })
  });

  const res = await fetch(
    `${FLOWLU_BASE_URL}/module/crm/lead/update?api_key=${FLOWLU_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }
  );

  const json = await res.json();

  return mapLead(json.response);
}

// DELETE JOB
export async function deleteJob(id: number): Promise<void> {
  const body = encodeForm({ id });

  await fetch(
    `${FLOWLU_BASE_URL}/module/crm/lead/delete?api_key=${FLOWLU_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }
  );
}
