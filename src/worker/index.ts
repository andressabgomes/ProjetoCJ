import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { 
  CreateTeamMemberSchema, 
  UpdateTeamMemberSchema,
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CreateTicketSchema,
  UpdateTicketSchema,
  CreateCommentSchema,
  CreatePhoneCallSchema,
  type ApiResponse
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ success: true, message: "CentralFlow API is running" });
});

// ==================== TEAM MEMBERS API ====================

// Get all team members
app.get("/api/team", async (c) => {
  try {
    const db = c.env.DB;
    
    const result = await db.prepare(`
      SELECT id, name, email, role, phone, department, is_active, created_at, updated_at
      FROM team_members 
      ORDER BY created_at DESC
    `).all();
    
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar membros da equipe" }, 500);
  }
});

// Get team member by ID
app.get("/api/team/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      SELECT id, name, email, role, phone, department, is_active, created_at, updated_at
      FROM team_members 
      WHERE id = ?
    `).bind(id).first();
    
    if (!result) {
      return c.json<ApiResponse>({ success: false, error: "Membro da equipe não encontrado" }, 404);
    }
    
    return c.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching team member:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar membro da equipe" }, 500);
  }
});

// Create team member
app.post("/api/team", zValidator("json", CreateTeamMemberSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    // Check if email already exists
    const existingMember = await db.prepare(`
      SELECT id FROM team_members WHERE email = ?
    `).bind(data.email).first();
    
    if (existingMember) {
      return c.json<ApiResponse>({ success: false, error: "Email já está em uso" }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO team_members (name, email, role, phone, department, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      data.name,
      data.email,
      data.role,
      data.phone || null,
      data.department || null
    ).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao criar membro da equipe" }, 500);
    }
    
    const newMember = await db.prepare(`
      SELECT id, name, email, role, phone, department, is_active, created_at, updated_at
      FROM team_members 
      WHERE id = ?
    `).bind(result.meta.last_row_id).first();
    
    return c.json<ApiResponse>({ success: true, data: newMember }, 201);
  } catch (error) {
    console.error("Error creating team member:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao criar membro da equipe" }, 500);
  }
});

// Update team member
app.put("/api/team/:id", zValidator("json", UpdateTeamMemberSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    // Check if member exists
    const existingMember = await db.prepare(`
      SELECT id FROM team_members WHERE id = ?
    `).bind(id).first();
    
    if (!existingMember) {
      return c.json<ApiResponse>({ success: false, error: "Membro da equipe não encontrado" }, 404);
    }
    
    // Check if email is unique (if email is being updated)
    if (data.email) {
      const emailExists = await db.prepare(`
        SELECT id FROM team_members WHERE email = ? AND id != ?
      `).bind(data.email, id).first();
      
      if (emailExists) {
        return c.json<ApiResponse>({ success: false, error: "Email já está em uso" }, 400);
      }
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (data.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(data.name);
    }
    if (data.email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(data.email);
    }
    if (data.role !== undefined) {
      updateFields.push("role = ?");
      updateValues.push(data.role);
    }
    if (data.phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(data.phone);
    }
    if (data.department !== undefined) {
      updateFields.push("department = ?");
      updateValues.push(data.department);
    }
    
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE team_members 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    
    const result = await db.prepare(updateQuery).bind(...updateValues).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao atualizar membro da equipe" }, 500);
    }
    
    const updatedMember = await db.prepare(`
      SELECT id, name, email, role, phone, department, is_active, created_at, updated_at
      FROM team_members 
      WHERE id = ?
    `).bind(id).first();
    
    return c.json<ApiResponse>({ success: true, data: updatedMember });
  } catch (error) {
    console.error("Error updating team member:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao atualizar membro da equipe" }, 500);
  }
});

// Toggle team member active status
app.patch("/api/team/:id/toggle-status", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      UPDATE team_members 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao alterar status do membro" }, 500);
    }
    
    const updatedMember = await db.prepare(`
      SELECT id, name, email, role, phone, department, is_active, created_at, updated_at
      FROM team_members 
      WHERE id = ?
    `).bind(id).first();
    
    return c.json<ApiResponse>({ success: true, data: updatedMember });
  } catch (error) {
    console.error("Error toggling team member status:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao alterar status do membro" }, 500);
  }
});

// Delete team member
app.delete("/api/team/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      DELETE FROM team_members WHERE id = ?
    `).bind(id).run();
    
    if (!result.success || result.meta.changes === 0) {
      return c.json<ApiResponse>({ success: false, error: "Membro da equipe não encontrado" }, 404);
    }
    
    return c.json<ApiResponse>({ success: true, message: "Membro da equipe removido com sucesso" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao remover membro da equipe" }, 500);
  }
});

// ==================== CUSTOMERS API ====================

// Get all customers
app.get("/api/customers", async (c) => {
  try {
    const db = c.env.DB;
    
    const result = await db.prepare(`
      SELECT * FROM customers 
      ORDER BY created_at DESC
    `).all();
    
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar clientes" }, 500);
  }
});

// Get customer by ID
app.get("/api/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).bind(id).first();
    
    if (!result) {
      return c.json<ApiResponse>({ success: false, error: "Cliente não encontrado" }, 404);
    }
    
    return c.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar cliente" }, 500);
  }
});

// Create customer
app.post("/api/customers", zValidator("json", CreateCustomerSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    // Check if email already exists (if provided)
    if (data.email && data.email.trim()) {
      const existingCustomer = await db.prepare(`
        SELECT id FROM customers WHERE email = ?
      `).bind(data.email).first();
      
      if (existingCustomer) {
        return c.json<ApiResponse>({ success: false, error: "Email já está em uso" }, 400);
      }
    }
    
    const result = await db.prepare(`
      INSERT INTO customers (
        name, email, phone, document, document_type, address_street, address_number,
        address_complement, address_neighborhood, address_city, address_state, 
        address_zipcode, company_name, contact_person, notes, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      data.name,
      data.email || null,
      data.phone || null,
      data.document || null,
      data.document_type || null,
      data.address_street || null,
      data.address_number || null,
      data.address_complement || null,
      data.address_neighborhood || null,
      data.address_city || null,
      data.address_state || null,
      data.address_zipcode || null,
      data.company_name || null,
      data.contact_person || null,
      data.notes || null
    ).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao criar cliente" }, 500);
    }
    
    const newCustomer = await db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).bind(result.meta.last_row_id).first();
    
    return c.json<ApiResponse>({ success: true, data: newCustomer }, 201);
  } catch (error) {
    console.error("Error creating customer:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao criar cliente" }, 500);
  }
});

// Update customer
app.put("/api/customers/:id", zValidator("json", UpdateCustomerSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    // Check if customer exists
    const existingCustomer = await db.prepare(`
      SELECT id FROM customers WHERE id = ?
    `).bind(id).first();
    
    if (!existingCustomer) {
      return c.json<ApiResponse>({ success: false, error: "Cliente não encontrado" }, 404);
    }
    
    // Check if email is unique (if email is being updated)
    if (data.email && data.email.trim()) {
      const emailExists = await db.prepare(`
        SELECT id FROM customers WHERE email = ? AND id != ?
      `).bind(data.email, id).first();
      
      if (emailExists) {
        return c.json<ApiResponse>({ success: false, error: "Email já está em uso" }, 400);
      }
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value || null);
      }
    });
    
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE customers 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    
    const result = await db.prepare(updateQuery).bind(...updateValues).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao atualizar cliente" }, 500);
    }
    
    const updatedCustomer = await db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).bind(id).first();
    
    return c.json<ApiResponse>({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao atualizar cliente" }, 500);
  }
});

// Toggle customer active status
app.patch("/api/customers/:id/toggle-status", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      UPDATE customers 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao alterar status do cliente" }, 500);
    }
    
    const updatedCustomer = await db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).bind(id).first();
    
    return c.json<ApiResponse>({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Error toggling customer status:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao alterar status do cliente" }, 500);
  }
});

// Delete customer
app.delete("/api/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      DELETE FROM customers WHERE id = ?
    `).bind(id).run();
    
    if (!result.success || result.meta.changes === 0) {
      return c.json<ApiResponse>({ success: false, error: "Cliente não encontrado" }, 404);
    }
    
    return c.json<ApiResponse>({ success: true, message: "Cliente removido com sucesso" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao remover cliente" }, 500);
  }
});

// ==================== TICKETS API ====================

// Get all tickets with customer and assignee info
app.get("/api/tickets", async (c) => {
  try {
    const db = c.env.DB;
    const customerId = c.req.query("customer_id");
    const limit = c.req.query("limit");
    
    let whereClause = "";
    let limitClause = "";
    const bindings = [];
    
    if (customerId) {
      whereClause = "WHERE t.customer_id = ?";
      const customerIdNum = parseInt(customerId as string, 10);
      if (isNaN(customerIdNum)) {
        return c.json<ApiResponse>({ success: false, error: "Invalid customer ID" }, 400);
      }
      bindings.push(customerIdNum);
    }
    
    if (limit) {
      limitClause = "LIMIT ?";
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum)) {
        return c.json<ApiResponse>({ success: false, error: "Invalid limit" }, 400);
      }
      bindings.push(limitNum);
    }
    
    const result = await db.prepare(`
      SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        tm.name as assigned_name,
        tm.email as assigned_email
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      ${whereClause}
      ORDER BY t.created_at DESC
      ${limitClause}
    `).bind(...bindings).all();
    
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar tickets" }, 500);
  }
});

// Get ticket by ID with comments
app.get("/api/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    const ticket = await db.prepare(`
      SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        tm.name as assigned_name,
        tm.email as assigned_email
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      WHERE t.id = ?
    `).bind(id).first();
    
    if (!ticket) {
      return c.json<ApiResponse>({ success: false, error: "Ticket não encontrado" }, 404);
    }
    
    const comments = await db.prepare(`
      SELECT 
        tc.*,
        CASE 
          WHEN tc.author_type = 'team' THEN tm.name 
          WHEN tc.author_type = 'customer' THEN c.name 
          ELSE 'Usuário Desconhecido'
        END as author_name,
        CASE 
          WHEN tc.author_type = 'team' THEN tm.email 
          WHEN tc.author_type = 'customer' THEN c.email 
          ELSE null
        END as author_email
      FROM ticket_comments tc
      LEFT JOIN team_members tm ON tc.author_type = 'team' AND tc.author_id = tm.id
      LEFT JOIN customers c ON tc.author_type = 'customer' AND tc.author_id = c.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `).bind(id).all();
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: { 
        ...ticket, 
        comments: comments.results 
      } 
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar ticket" }, 500);
  }
});

// Create ticket
app.post("/api/tickets", zValidator("json", CreateTicketSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    const result = await db.prepare(`
      INSERT INTO tickets (
        title, description, status, priority, category, customer_id, assigned_to, created_by, channel, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      data.title,
      data.description || null,
      data.status,
      data.priority,
      data.category || null,
      data.customer_id || null,
      data.assigned_to || null,
      1, // created_by - defaulting to 1 for now
      data.channel
    ).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao criar ticket" }, 500);
    }
    
    const newTicket = await db.prepare(`
      SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        tm.name as assigned_name,
        tm.email as assigned_email
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      WHERE t.id = ?
    `).bind(result.meta.last_row_id).first();
    
    return c.json<ApiResponse>({ success: true, data: newTicket }, 201);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao criar ticket" }, 500);
  }
});

// Update ticket
app.put("/api/tickets/:id", zValidator("json", UpdateTicketSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    // Check if ticket exists
    const existingTicket = await db.prepare(`
      SELECT id FROM tickets WHERE id = ?
    `).bind(id).first();
    
    if (!existingTicket) {
      return c.json<ApiResponse>({ success: false, error: "Ticket não encontrado" }, 404);
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });
    
    // Handle closed_at based on status
    if (data.status) {
      if (data.status === 'closed' || data.status === 'resolved') {
        updateFields.push("closed_at = CURRENT_TIMESTAMP");
      } else {
        updateFields.push("closed_at = NULL");
      }
    }
    
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE tickets 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    
    const result = await db.prepare(updateQuery).bind(...updateValues).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao atualizar ticket" }, 500);
    }
    
    const updatedTicket = await db.prepare(`
      SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        tm.name as assigned_name,
        tm.email as assigned_email
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      WHERE t.id = ?
    `).bind(id).first();
    
    return c.json<ApiResponse>({ success: true, data: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao atualizar ticket" }, 500);
  }
});

// Delete ticket
app.delete("/api/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    
    // Delete comments first
    await db.prepare(`DELETE FROM ticket_comments WHERE ticket_id = ?`).bind(id).run();
    
    // Delete ticket
    const result = await db.prepare(`DELETE FROM tickets WHERE id = ?`).bind(id).run();
    
    if (!result.success || result.meta.changes === 0) {
      return c.json<ApiResponse>({ success: false, error: "Ticket não encontrado" }, 404);
    }
    
    return c.json<ApiResponse>({ success: true, message: "Ticket removido com sucesso" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao remover ticket" }, 500);
  }
});

// Add comment to ticket
app.post("/api/tickets/:id/comments", zValidator("json", CreateCommentSchema), async (c) => {
  try {
    const ticketId = c.req.param("id");
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    // Check if ticket exists
    const ticket = await db.prepare(`SELECT id FROM tickets WHERE id = ?`).bind(ticketId).first();
    if (!ticket) {
      return c.json<ApiResponse>({ success: false, error: "Ticket não encontrado" }, 404);
    }
    
    const result = await db.prepare(`
      INSERT INTO ticket_comments (ticket_id, author_id, author_type, content, is_internal, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      ticketId,
      1, // author_id - defaulting to 1 for now
      'team', // author_type - defaulting to team for now
      data.content,
      data.is_internal
    ).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao adicionar comentário" }, 500);
    }
    
    // Update ticket's updated_at
    await db.prepare(`UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(ticketId).run();
    
    const newComment = await db.prepare(`
      SELECT 
        tc.*,
        tm.name as author_name,
        tm.email as author_email
      FROM ticket_comments tc
      LEFT JOIN team_members tm ON tc.author_type = 'team' AND tc.author_id = tm.id
      WHERE tc.id = ?
    `).bind(result.meta.last_row_id).first();
    
    return c.json<ApiResponse>({ success: true, data: newComment }, 201);
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao adicionar comentário" }, 500);
  }
});

// Get ticket statistics
app.get("/api/tickets/stats", async (c) => {
  try {
    const db = c.env.DB;
    
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high
      FROM tickets
    `).first();
    
    return c.json<ApiResponse>({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar estatísticas" }, 500);
  }
});

// ==================== PHONE CALLS API ====================

// Create phone call log (and optionally create ticket)
app.post("/api/phone-calls", zValidator("json", CreatePhoneCallSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = c.env.DB;
    
    let ticketId = null;
    
    // Create ticket if requested
    if (data.create_ticket && data.ticket_data) {
      const ticketResult = await db.prepare(`
        INSERT INTO tickets (
          title, description, status, priority, category, customer_id, assigned_to, created_by, channel, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        data.ticket_data.title,
        data.ticket_data.description || null,
        'open',
        data.ticket_data.priority,
        'Ligação Telefônica',
        data.customer_id || null,
        null, // assigned_to
        1, // created_by - defaulting to 1 for now
        data.ticket_data.channel
      ).run();
      
      if (ticketResult.success) {
        ticketId = ticketResult.meta.last_row_id;
      }
    }
    
    // Create phone call log
    const result = await db.prepare(`
      INSERT INTO phone_call_logs (
        caller_phone, customer_id, call_duration, call_status, notes, ticket_id, created_by, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      data.caller_phone,
      data.customer_id || null,
      data.call_duration || null,
      data.call_status,
      data.notes || null,
      ticketId,
      1 // created_by - defaulting to 1 for now
    ).run();
    
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: "Erro ao registrar ligação" }, 500);
    }
    
    const newCallLog = await db.prepare(`
      SELECT 
        pcl.*,
        c.name as customer_name,
        c.email as customer_email
      FROM phone_call_logs pcl
      LEFT JOIN customers c ON pcl.customer_id = c.id
      WHERE pcl.id = ?
    `).bind(result.meta.last_row_id).first();
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: { 
        call_log: newCallLog,
        ticket_id: ticketId 
      } 
    }, 201);
  } catch (error) {
    console.error("Error creating phone call log:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao registrar ligação" }, 500);
  }
});

// Get all phone call logs
app.get("/api/phone-calls", async (c) => {
  try {
    const db = c.env.DB;
    
    const result = await db.prepare(`
      SELECT 
        pcl.*,
        c.name as customer_name,
        c.email as customer_email
      FROM phone_call_logs pcl
      LEFT JOIN customers c ON pcl.customer_id = c.id
      ORDER BY pcl.created_at DESC
    `).all();
    
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    console.error("Error fetching phone call logs:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar logs de ligações" }, 500);
  }
});

// ==================== ANALYTICS API ====================

// Analytics endpoint for operational indicators
app.get("/api/analytics", async (c) => {
  try {
    const period = c.req.query("period") || "30d";
    const db = c.env.DB;
    
    // Calculate date range based on period
    let daysBack = 30;
    if (period === "7d") daysBack = 7;
    if (period === "90d") daysBack = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString();
    
    // 1. Taxa de reabertura de chamados
    const reopenStats = await db.prepare(`
      WITH resolved_tickets AS (
        SELECT 
          id,
          created_at,
          updated_at,
          LAG(status) OVER (PARTITION BY id ORDER BY updated_at) as prev_status
        FROM tickets 
        WHERE created_at >= ? 
        AND (status = 'resolved' OR status = 'closed')
      ),
      reopened_tickets AS (
        SELECT DISTINCT id
        FROM tickets 
        WHERE created_at >= ?
        AND status IN ('open', 'in_progress', 'pending')
        AND id IN (
          SELECT DISTINCT id 
          FROM tickets 
          WHERE status IN ('resolved', 'closed')
          AND updated_at < (
            SELECT MAX(updated_at) 
            FROM tickets t2 
            WHERE t2.id = tickets.id 
            AND t2.status IN ('open', 'in_progress', 'pending')
          )
        )
      )
      SELECT 
        (SELECT COUNT(DISTINCT id) FROM tickets WHERE created_at >= ? AND status IN ('resolved', 'closed')) as total_resolved,
        (SELECT COUNT(*) FROM reopened_tickets) as total_reopened
    `).bind(startDateStr, startDateStr, startDateStr).first();
    
    const totalResolved = Number(reopenStats?.total_resolved || 0);
    const totalReopened = Number(reopenStats?.total_reopened || 0);
    const reopenRate = totalResolved > 0 ? (totalReopened / totalResolved) * 100 : 0;
    
    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysBack);
    const prevStartDateStr = prevStartDate.toISOString();
    
    const prevReopenStats = await db.prepare(`
      WITH resolved_tickets AS (
        SELECT 
          id,
          created_at,
          updated_at
        FROM tickets 
        WHERE created_at >= ? AND created_at < ?
        AND status IN ('resolved', 'closed')
      ),
      reopened_tickets AS (
        SELECT DISTINCT id
        FROM tickets 
        WHERE created_at >= ? AND created_at < ?
        AND status IN ('open', 'in_progress', 'pending')
        AND id IN (
          SELECT DISTINCT id 
          FROM tickets 
          WHERE status IN ('resolved', 'closed')
        )
      )
      SELECT 
        (SELECT COUNT(DISTINCT id) FROM resolved_tickets) as total_resolved,
        (SELECT COUNT(*) FROM reopened_tickets) as total_reopened
    `).bind(prevStartDateStr, startDateStr, prevStartDateStr, startDateStr).first();
    
    const prevTotalResolved = Number(prevReopenStats?.total_resolved || 0);
    const prevTotalReopened = Number(prevReopenStats?.total_reopened || 0);
    const prevReopenRate = prevTotalResolved > 0 ? (prevTotalReopened / prevTotalResolved) * 100 : 0;
    
    const reopenRateChange = prevReopenRate > 0 ? ((reopenRate - prevReopenRate) / prevReopenRate) * 100 : 0;
    
    // 2. Tempo médio de primeira resposta
    const responseTimeStats = await db.prepare(`
      WITH first_responses AS (
        SELECT 
          t.id,
          t.created_at as ticket_created,
          MIN(tc.created_at) as first_response
        FROM tickets t
        LEFT JOIN ticket_comments tc ON t.id = tc.ticket_id AND tc.author_type = 'team'
        WHERE t.created_at >= ?
        GROUP BY t.id, t.created_at
        HAVING first_response IS NOT NULL
      )
      SELECT 
        AVG((julianday(first_response) - julianday(ticket_created)) * 24 * 60) as avg_response_time_minutes,
        COUNT(*) as tickets_with_response
      FROM first_responses
    `).bind(startDateStr).first();
    
    const avgResponseTime = Number(responseTimeStats?.avg_response_time_minutes || 0);
    const targetResponseTime = 30; // 30 minutes target
    
    // Previous period response time
    const prevResponseTimeStats = await db.prepare(`
      WITH first_responses AS (
        SELECT 
          t.id,
          t.created_at as ticket_created,
          MIN(tc.created_at) as first_response
        FROM tickets t
        LEFT JOIN ticket_comments tc ON t.id = tc.ticket_id AND tc.author_type = 'team'
        WHERE t.created_at >= ? AND t.created_at < ?
        GROUP BY t.id, t.created_at
        HAVING first_response IS NOT NULL
      )
      SELECT 
        AVG((julianday(first_response) - julianday(ticket_created)) * 24 * 60) as avg_response_time_minutes
      FROM first_responses
    `).bind(prevStartDateStr, startDateStr).first();
    
    const prevAvgResponseTime = Number(prevResponseTimeStats?.avg_response_time_minutes || 0);
    const responseTimeChange = prevAvgResponseTime > 0 ? ((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100 : 0;
    
    // 3. Utilização da capacidade da equipe
    const teamStats = await db.prepare(`
      SELECT 
        COUNT(*) as total_agents,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_agents
      FROM team_members
    `).first();
    
    const totalAgents = Number(teamStats?.total_agents || 0);
    const activeAgents = Number(teamStats?.active_agents || 0);
    
    // Calculate utilization based on assigned tickets
    const utilizationStats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT assigned_to) as agents_with_tickets,
        COUNT(*) as active_tickets
      FROM tickets 
      WHERE assigned_to IS NOT NULL 
      AND status IN ('open', 'in_progress', 'pending')
      AND created_at >= ?
    `).bind(startDateStr).first();
    
    const agentsWithTickets = Number(utilizationStats?.agents_with_tickets || 0);
    const utilization = activeAgents > 0 ? (agentsWithTickets / activeAgents) * 100 : 0;
    
    // Previous period utilization
    const prevUtilizationStats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT assigned_to) as agents_with_tickets
      FROM tickets 
      WHERE assigned_to IS NOT NULL 
      AND status IN ('open', 'in_progress', 'pending')
      AND created_at >= ? AND created_at < ?
    `).bind(prevStartDateStr, startDateStr).first();
    
    const prevAgentsWithTickets = Number(prevUtilizationStats?.agents_with_tickets || 0);
    const prevUtilization = activeAgents > 0 ? (prevAgentsWithTickets / activeAgents) * 100 : 0;
    const utilizationChange = prevUtilization > 0 ? ((utilization - prevUtilization) / prevUtilization) * 100 : 0;
    
    // Generate historical data for charts
    const intervals = Math.min(daysBack, 10); // Max 10 data points
    const intervalDays = Math.floor(daysBack / intervals);
    
    const historicalData = [];
    const labels = [];
    
    for (let i = 0; i < intervals; i++) {
      const intervalStart = new Date(startDate);
      intervalStart.setDate(startDate.getDate() + (i * intervalDays));
      const intervalEnd = new Date(intervalStart);
      intervalEnd.setDate(intervalStart.getDate() + intervalDays);
      
      // Format label
      if (daysBack <= 7) {
        labels.push(intervalStart.toLocaleDateString('pt-BR', { weekday: 'short' }));
      } else if (daysBack <= 30) {
        labels.push(intervalStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      } else {
        labels.push(intervalStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      }
      
      // Mock historical data for now (in a real implementation, you'd calculate these)
      historicalData.push({
        reopenRate: Math.max(0, Number(reopenRate) + (Math.random() - 0.5) * 2),
        responseTime: Math.max(15, avgResponseTime + (Math.random() - 0.5) * 20),
        utilization: Math.max(50, utilization + (Math.random() - 0.5) * 20)
      });
    }
    
    const analyticsData = {
      reopenRate: {
        value: reopenRate,
        trend: reopenRateChange >= 0 ? 'up' : 'down',
        change: `${Math.abs(reopenRateChange).toFixed(1)}%`,
        totalResolved,
        totalReopened
      },
      firstResponseTime: {
        value: avgResponseTime,
        trend: responseTimeChange >= 0 ? 'up' : 'down',
        change: `${Math.abs(responseTimeChange).toFixed(1)}%`,
        target: targetResponseTime
      },
      teamUtilization: {
        value: utilization,
        trend: utilizationChange >= 0 ? 'up' : 'down',
        change: `${Math.abs(utilizationChange).toFixed(1)}%`,
        activeAgents,
        totalAgents
      },
      periodData: {
        period,
        reopenRates: historicalData.map(d => d.reopenRate),
        responseTimes: historicalData.map(d => d.responseTime),
        utilizations: historicalData.map(d => d.utilization),
        labels
      }
    };
    
    return c.json<ApiResponse>({ success: true, data: analyticsData });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json<ApiResponse>({ success: false, error: "Erro ao buscar analytics" }, 500);
  }
});

// Fallback for unmatched routes
app.all("*", (c) => {
  return c.json<ApiResponse>({ success: false, error: "Endpoint não encontrado" }, 404);
});

// Export as Cloudflare Workers format
export default {
  fetch: app.fetch,
};
