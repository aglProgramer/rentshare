package com.rentshare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Habilita un broker simple para el prefijo /topic (broadcast)
        config.enableSimpleBroker("/topic");
        // Prefijo para los mensajes que van del cliente al servidor (@MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Endpoint de conexión para SockJS
        registry.addEndpoint("/ws-rentshare")
                .setAllowedOrigins("http://localhost:5500", "http://127.0.0.1:5500", "https://alejandrog1117.github.io", "*")
                .withSockJS();
    }
}
