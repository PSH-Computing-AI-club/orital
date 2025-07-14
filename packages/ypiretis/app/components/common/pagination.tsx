import type {BoxProps} from "@chakra-ui/react";
import {Box, HStack, Span} from "@chakra-ui/react";

import ChevronLeftIcon from "~/components/icons/chevron_left_icon";
import ChevronRightIcon from "~/components/icons/chevron_right_icon";

import Links from "./links";

export type IPaginationTemplate = (
    context: IPaginationTemplateContext,
) => string | URL;

export interface IPaginationTemplateContext {
    readonly page: number;
}

export interface IPaginationPageNumberProps {
    readonly currentPage: number;

    readonly page: number;

    readonly template: IPaginationTemplate;
}

export interface IPaginationFirstLinkProps {
    readonly rangeMin: number;

    readonly template: IPaginationTemplate;
}

export interface IPaginationLastLinkProps {
    readonly pages: number;

    readonly rangeMax: number;

    readonly template: IPaginationTemplate;
}

export interface IPaginationNextLinkProps {
    readonly currentPage: number;

    readonly pages: number;

    readonly template: IPaginationTemplate;
}

export interface IPaginationPreviousLinkProps {
    readonly currentPage: number;

    readonly template: IPaginationTemplate;
}

export interface IPaginationItemProps extends BoxProps {}

export interface IPaginationProps extends BoxProps {
    readonly currentPage: number;

    readonly pageRange: number;

    readonly pages: number;

    readonly template: IPaginationTemplate;
}

function PaginationPageNumber(props: IPaginationPageNumberProps) {
    const {currentPage, page, template} = props;

    if (page === currentPage) {
        return (
            <PaginationItem>
                <Span aria-current="page" fontWeight="bold">
                    {page}
                </Span>
            </PaginationItem>
        );
    }

    const to = template({page});

    return (
        <PaginationItem>
            <Links.InternalLink aria-label={`Page ${page}.`} to={to}>
                {page}
            </Links.InternalLink>
        </PaginationItem>
    );
}

function PaginationFirstLink(props: IPaginationFirstLinkProps) {
    const {rangeMin, template} = props;

    if (rangeMin <= 1) {
        return;
    }

    const to = template({page: 1});

    return (
        <>
            <PaginationItem>
                <Links.InternalLink aria-label="Page 1." to={to}>
                    1
                </Links.InternalLink>
            </PaginationItem>

            <PaginationItem aria-hidden="true">...</PaginationItem>
        </>
    );
}

function PaginationLastLink(props: IPaginationLastLinkProps) {
    const {pages, rangeMax, template} = props;

    if (rangeMax >= pages) {
        return;
    }

    const to = template({page: pages});

    return (
        <>
            <PaginationItem aria-hidden="true">...</PaginationItem>

            <PaginationItem>
                <Links.InternalLink aria-label={`Page ${pages}.`} to={to}>
                    {pages}
                </Links.InternalLink>
            </PaginationItem>
        </>
    );
}

function PaginationNextLink(props: IPaginationNextLinkProps) {
    const {currentPage, pages, template} = props;

    if (currentPage >= pages) {
        return;
    }

    const page = currentPage + 1;
    const to = template({page});

    return (
        <PaginationItem>
            <Links.InternalLink aria-label="Next page." to={to}>
                <ChevronRightIcon />
            </Links.InternalLink>
        </PaginationItem>
    );
}

function PaginationPreviousLink(props: IPaginationPreviousLinkProps) {
    const {currentPage, template} = props;

    if (currentPage <= 1) {
        return;
    }

    const page = currentPage - 1;
    const to = template({page});

    return (
        <PaginationItem>
            <Links.InternalLink aria-label="Previous page." to={to}>
                <ChevronLeftIcon />
            </Links.InternalLink>
        </PaginationItem>
    );
}

function PaginationItem(props: IPaginationItemProps) {
    const {children, ...rest} = props;

    return (
        <Box as="li" display="inline-flex" alignItems="center" {...rest}>
            {children}
        </Box>
    );
}

export default function Pagination(props: IPaginationProps) {
    const {currentPage, pageRange, pages, template, ...rest} = props;

    const rangeMin = Math.max(1, currentPage - pageRange);
    const rangeMax = Math.min(pages, currentPage + pageRange);

    const rangeDelta = Math.max(1, rangeMax - rangeMin + 1);

    const paginationPages = Array.from({length: rangeDelta})
        .fill(null)
        .map((_value, index) => {
            return rangeMin + index;
        });

    return (
        <Box as="nav" aria-label="Pagination" userSelect="none" {...rest}>
            <HStack as="ol" gap="4" justifyContent="center" fontSize="xl">
                <PaginationPreviousLink
                    currentPage={currentPage}
                    template={template}
                />

                <PaginationFirstLink rangeMin={rangeMin} template={template} />

                {paginationPages.map((page) => {
                    return (
                        <PaginationPageNumber
                            key={page}
                            currentPage={currentPage}
                            page={page}
                            template={template}
                        />
                    );
                })}

                <PaginationLastLink
                    rangeMax={rangeMax}
                    pages={pages}
                    template={template}
                />

                <PaginationNextLink
                    currentPage={currentPage}
                    pages={pages}
                    template={template}
                />
            </HStack>
        </Box>
    );
}
