
package com.printifycheck.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidationCheck {
    private String id;
    private String name;
    private String description;
    private ValidationCategory category;
    private boolean automated;
    private String repairStrategy;
    private boolean enabled;
}
