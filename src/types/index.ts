export type UserRole = 'cutting_supervisor' | 'cutting_verifier' | 'sewing_supervisor';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface RecipeComponent {
  id: number;
  recipe_id: number;
  component_name: string;
  pieces_per_garment: number;
  image_url?: string | null;
}

export interface Recipe {
  id: number;
  recipe_code: string;
  name: string;
  category: string;
  std_fabric_yards: number;
  wastage_cap: number;
  recipe_components: RecipeComponent[];
}

export type ComponentTrafficStatus = 'MATCH' | 'EXCESS' | 'SHORTAGE'; // GREEN, YELLOW, RED

export interface VerificationItem {
  id: number;
  order_id: number;
  component_id: number;
  expected_qty: number;
  actual_qty: number;
  status: ComponentTrafficStatus;
  component: RecipeComponent;
}

export interface VerificationLog {
  id: number;
  order_id: number;
  verifier_id: number;
  decision: 'APPROVED' | 'REJECTED';
  rejection_note?: string | null;
  wastage_pct: number;
  timestamp: string;
  verifier?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface ComponentEvaluation {
  component_id: number;
  component_name: string;
  expected_qty: number;
  actual_qty: number;
  status: ComponentTrafficStatus;
  variance: number;
  deficit: number;
}

export interface GatekeeperEvaluationResult {
  canApprove: boolean;
  hasShortage: boolean;
  components: ComponentEvaluation[];
  shortages: ComponentEvaluation[];
  totalExpected: number;
  totalActual: number;
}

export interface WastageEvaluationResult {
  actualFabricYards: number;
  expectedFabricYards: number;
  wastagePct: number;
  wastageCap: number;
  exceededCap: boolean;
}

export type OrderStatus =
  | 'PENDING_CUTTING'
  | 'READY_FOR_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'IN_SEWING'
  | 'COMPLETED';

export interface CuttingOrder {
  id: number;
  order_no: string;
  recipe_id: number;
  recipe: Recipe;
  target_qty: number;
  fabric_roll_id: string;
  actual_fabric_yds: number;
  status: OrderStatus;
  created_by: number;
  creator?: {
    id: number;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  verification_items: VerificationItem[];
  verification_logs: VerificationLog[];
  gatekeeper?: GatekeeperEvaluationResult;
  wastage?: WastageEvaluationResult;
  latestApprovalLog?: VerificationLog;
}

