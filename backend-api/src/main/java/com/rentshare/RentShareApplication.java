package com.rentshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada principal de la aplicación RentShare.
 * 
 * RentShare es una plataforma de gestión de gastos compartidos
 * diseñada para grupos de personas que comparten vivienda.
 */
@SpringBootApplication
public class RentShareApplication {

    public static void main(String[] args) {
        SpringApplication.run(RentShareApplication.class, args);
        System.out.println("\n✅ RentShare API corriendo en: http://localhost:8080");
        System.out.println("📊 Consola H2: http://localhost:8080/h2-console");
        System.out.println("📋 Gastos API: http://localhost:8080/api/expenses\n");
    }
}
