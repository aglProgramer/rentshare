package com.rentshare.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentshare.application.commands.CreateExpenseCommand;
import com.rentshare.model.Category;
import com.rentshare.model.Tipo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional // Rollback asegurado después de cada prueba
public class ExpenseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateExpenseAndReturnDto() throws Exception {
        CreateExpenseCommand command = CreateExpenseCommand.builder()
                .descripcion("Cena de Grupo")
                .monto(new BigDecimal("150000.00"))
                .fecha(LocalDate.now())
                .categoria(Category.OTRO)
                .tipo(Tipo.UNIFICADO)
                .pagadoPorId(1L) // Usuario por defecto en config/data.sql usualmente o ignora Fails dependiendo de foreign keys
                .build();

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.descripcion").value("Cena de Grupo"))
                .andExpect(jsonPath("$.monto").value(150000.00));

        // Verificar CQRS Read Model
        mockMvc.perform(get("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].descripcion").value("Cena de Grupo"));
    }
}
