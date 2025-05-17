
package com.printifycheck;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PrintifyCheckApplication {

    public static void main(String[] args) {
        SpringApplication.run(PrintifyCheckApplication.class, args);
    }
}
