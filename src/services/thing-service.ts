import Thing from "../graphql/models/thing";
import fetch from 'node-fetch';
import {
    THINGIVERSE_API_SEARCH_URL,
    THINGIVERSE_API_THING_LIKE_URL,
    THINGIVERSE_API_THING_WATCH_URL,
    THINGIVERSE_API_THINGS_URL
} from "../consts";
import {checkStatus} from "../fetch-utils";
import SearchThingResponse from "../graphql/models/search-thing-response";

interface ThingsSearchParams {
    sort: string
    is_featured?: boolean
    query?: string
}


export function findById(id: number, token: string): Promise<Thing> {
    const url = `${THINGIVERSE_API_THINGS_URL}/${id}`;

    return fetch(url, {
        method: "GET",
        headers: getHeaders(token)
    })
        .then(checkStatus)
        .then(response => response.json())
        .then(response => {
            return new Thing(response.id, response.name, response.public_url, response.like_count, response.is_liked,
                response.comment_count, response.default_image.url, response.description_html, response.is_watched);
        })
        .catch(error => {
            console.log(error);
            throw new Error(error.toString());
        });
}

export function search(page: number, per_page: number, token: string, searchParams: ThingsSearchParams): Promise<SearchThingResponse> {
    const qParams = [
        `sort=${searchParams.sort}`,
        searchParams.is_featured ? `is_featured=1` : null,
        `page=${page}`,
        `per_page=${per_page}`,
    ].join("&");
    const url = `${THINGIVERSE_API_SEARCH_URL}${searchParams.query ? "/" + searchParams.query : "/things"}?${qParams}`;

    return fetch(url, {
        method: "GET",
        headers: getHeaders(token),
        timeout: 20000
    })
        .then(checkStatus)
        .then(response => response.json())
        .then(response => {
            if (response && response.hits) {
                return new SearchThingResponse(
                    response.total,
                    response.hits.map((thing: any) => new Thing(thing.id, thing.name, thing.public_url, thing.like_count, thing.is_liked, thing.comment_count, thing.preview_image))
                );
            } else {
                return new SearchThingResponse(0, []);
            }
        })
        .catch(error => {
            console.log(error);
            throw new Error(error.toString());
        });
}

export function setThingLike(like: boolean, thing_id: number, token: string) {
    const url = THINGIVERSE_API_THING_LIKE_URL.replace(":id", thing_id.toString());

    return fetch(url, {
        method: like ? "POST" : "DELETE",
        headers: getHeaders(token),
        timeout: 20000
    })
        .then(checkStatus)
        .then(response => response.json())
        .then(response => {
            return response.ok === "ok";
        })
        .catch(error => {
            console.log(error);
            throw new Error(error.toString());
        });
}

export function setThingWatch(watch: boolean, thing_id: number, token: string) {
    const url = THINGIVERSE_API_THING_WATCH_URL.replace(":id", thing_id.toString());

    return fetch(url, {
        method: "POST",
        headers: getHeaders(token),
        timeout: 20000
    })
        .then(checkStatus)
        .then(response => response.json())
        .then(response => {
            return response.ok === "ok";
        })
        .catch(error => {
            console.log(error);
            throw new Error(error.toString());
        });
}


function getHeaders(token: string) {
    return {
        "Authorization": `Bearer ${token}`
    };
}
