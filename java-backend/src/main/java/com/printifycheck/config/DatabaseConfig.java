
package com.printifycheck.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class DatabaseConfig {

    @Value("${job.queue.max-concurrent-jobs:4}")
    private int maxConcurrentJobs;
    
    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maximumPoolSize;
    
    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minimumIdle;
    
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
