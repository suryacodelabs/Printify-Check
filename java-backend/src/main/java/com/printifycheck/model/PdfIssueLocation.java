
package com.printifycheck.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfIssueLocation {
    private float x;
    private float y;
    private float width;
    private float height;
    private int page;
    
    // Helper method to determine if this location overlaps with another
    public boolean overlaps(PdfIssueLocation other) {
        if (this.page != other.page) {
            return false;
        }
        
        // Check if rectangles overlap
        return !(this.x > other.x + other.width ||
                this.x + this.width < other.x ||
                this.y > other.y + other.height ||
                this.y + this.height < other.y);
    }
    
    // Helper method to merge with another location
    public PdfIssueLocation merge(PdfIssueLocation other) {
        if (this.page != other.page) {
            return this;
        }
        
        float newX = Math.min(this.x, other.x);
        float newY = Math.min(this.y, other.y);
        float newWidth = Math.max(this.x + this.width, other.x + other.width) - newX;
        float newHeight = Math.max(this.y + this.height, other.y + other.height) - newY;
        
        return PdfIssueLocation.builder()
                .x(newX)
                .y(newY)
                .width(newWidth)
                .height(newHeight)
                .page(this.page)
                .build();
    }
}
