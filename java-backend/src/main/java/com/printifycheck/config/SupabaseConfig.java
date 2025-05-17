
package com.printifycheck.config;

import io.github.supabase.SupabaseClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${job.queue.max-concurrent-jobs:4}")
    private int maxConcurrentJobs;
    
    @Bean
    public SupabaseClient supabaseClient() {
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseKey == null || supabaseKey.isEmpty()) {
            throw new IllegalArgumentException("Supabase URL and key must be configured in application.properties or environment variables");
        }
        return new SupabaseClient(supabaseUrl, supabaseKey);
    }
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(maxConcurrentJobs / 2);
        executor.setMaxPoolSize(maxConcurrentJobs);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("printify-check-");
        executor.initialize();
        return executor;
    }
}
